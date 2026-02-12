import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type ColumnDef } from "@tanstack/react-table";
import * as Yup from "yup";
import { FormikProvider, useFormik } from "formik";
import Autocomplete from "@mui/material/Autocomplete";
import MuiTextField from "@mui/material/TextField";
import Button from "../../../components/Button";
import DataTable from "../../../components/table/DataTable";
import TextField from "../../../components/TextField";
import { addOrder, deleteOrder, updateOrder, setOrders } from "../../../store/slices/ordersSlice";
import type { OrderItem } from "../../../store/slices/ordersSlice";
import type { RootState, AppDispatch } from "../../../store";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../features/auth/authContext";
import { getProducts } from "../../../api/products";
import { setRecipes } from "../../../store/slices/recipesSlice";
import Loader from "../../../components/Loader";
import { createOrder, deleteOrderById, getOrders, updateOrderById } from "../../../api/orders";
import { getCustomers } from "../../../api/customers";
import { addCustomer, setCustomers } from "../../../store/slices/customerSlice";
import ConfirmationModal from "../../../components/ConfirmationModal";

import { formatDate } from "../../../utils/dateUtils";

// --- TYPES ---
type FormItem = {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
};

type OrderFormValues = {
  customerName: string;
  phoneNumber: string;
  address: string;
  items: FormItem[];
  orderDate: string;
  status: "PENDING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  grandTotal: string;
};

// --- HELPER: Currency Formatter ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const Orders = () => {
  const { theme } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  // Redux Data
  const orders = useSelector((state: RootState) => state.orders.items);
  const recipes = useSelector((state: RootState) => state.recipes.items);
  const customers = useSelector((state: RootState) => state.customers.items);

  // Local State
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const resetFilters = () => {
    setStatusFilter("");
    setCustomerFilter("");
    setDateFilter("");
  };
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Product Adder State
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [currentQty, setCurrentQty] = useState<string>("1");

  const transitionMs = 300;

  // --- HELPERS ---
  const getFutureDate = (daysToAdd: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- HANDLERS ---
  const handleOpen = () => {
    setMounted(true);
    requestAnimationFrame(() => setOpen(true));
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setMounted(false);
      setEditingItem(null);
      setCurrentProduct(null);
      setCurrentQty("1");
    }, transitionMs);
  };

  // --- VALIDATION ---
  const validationSchema = useMemo(() => Yup.object({
    customerName: Yup.string().required("Customer name is required"),
    phoneNumber: Yup.string().when('customerName', {
      is: (name: string) => name && !customers.some(c => c.name === name),
      then: (schema) => schema.required("Phone number is required"),
      otherwise: (schema) => schema.optional(),
    }),
    address: Yup.string().when('customerName', {
      is: (name: string) => name && !customers.some(c => c.name === name),
      then: (schema) => schema.required("Address is required"),
      otherwise: (schema) => schema.optional(),
    }),
    items: Yup.array()
      .of(
        Yup.object().shape({
          productId: Yup.string().required(),
          quantity: Yup.number().min(1, "Qty must be at least 1").required(),
          sellingPrice: Yup.number().required()
        })
      )
      .min(1, "Please add at least one product"),
    orderDate: Yup.string().required("Order date is required"),
    status: Yup.mixed().oneOf(["PENDING", "ONGOING", "COMPLETED", "CANCELLED"]).required(),
    grandTotal: Yup.number().typeError("Must be a number").required("Total is required"),
  }), [customers]);

  // --- FORMIK ---
  const formik = useFormik<OrderFormValues>({
    enableReinitialize: true,
    initialValues: {
      customerName: editingItem?.customerName ?? "",
      phoneNumber: editingItem?.phoneNumber ?? "",
      address: editingItem?.address ?? "",
      items: editingItem?.orderItems?.map((item: any) => ({
        productId: item.product.id,
        productName: item.product?.name || "Unknown Product",
        quantity: item.quantity,
        sellingPrice: item.sellingPrice
      })) || [],
      orderDate: editingItem?.orderDate ? new Date(editingItem.orderDate).toISOString().split('T')[0] : "",
      status: (editingItem?.status as any) ?? "PENDING",
      grandTotal: editingItem ? String(editingItem.grandTotal) : "",
    },
    validationSchema: validationSchema,
    onSubmit: async(values, helpers) => {
      const existingCustomer = customers.find(c => c.name === values.customerName);
      console.log("existingCustomer", values, existingCustomer);
      const payload = {
        customer: {
          customerId: existingCustomer ? existingCustomer.id : null,
          name: values.customerName,
          phone: values.phoneNumber,
          address: values.address
        },
        items: values.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          sellingPrice: i.sellingPrice
        })),
        grandTotal: Number(values.grandTotal),
        orderDate: values.orderDate,
        status: values.status,
      };

      console.log("payloadpayload", payload);
      setLoading(true);
      if (editingItem) {
        const {status, message, data} = await updateOrderById(payload, editingItem.id);
        if (status === 200) {
          const mappedOrder: OrderItem = {
            id: data.id,
            productIds: data.orderItems?.map((i: any) => i.productId),
            orderItems: data?.orderItems,
            customerName: data.customerName,
            phoneNumber: data.customer?.phone,
            address: data.customer?.address,
            orderDate: data.orderDate,
            status: data.status,
            grandTotal: data.grandTotal,
          };
          dispatch(updateOrder(mappedOrder));
          toast.success(message || "Order updated");
          if (isNewCustomer) {
            dispatch(addCustomer({
              id: data.customer.id,
              name: data.customerName,
              phone: data.customer?.phone,
              address: data.customer?.address,
            }));
          }
        } else {
          toast.error(message || "Failed to update order");
        }
      } else {
        const {status, message, data} = await createOrder(payload);
        console.log("status", status);
        console.log("message", message);
        console.log("data", data);
        if (status === 200) {
          const mappedOrder: OrderItem = {
            id: data.id,
            productIds: data.orderItems.map((i: any) => i.productId),
            orderItems: data.orderItems,
            customerName: data.customerName,
            phoneNumber: data.customer?.phone,
            address: data.customer?.address,
            orderDate: data.orderDate,
            status: data.status,
            grandTotal: data.grandTotal,
          };
          dispatch(addOrder(mappedOrder));
          console.log("isNewCustomer", isNewCustomer);
          if (isNewCustomer) {
            dispatch(addCustomer({
              id: data.customer.id,
              name: data.customerName,
              phone: data.customer?.phone,
              address: data.customer?.address,
            }));
          }
          toast.success(message || "Order added");
        } else {
          toast.error(message || "Failed to add order");
        }
      }
      setLoading(false);
      
      helpers.resetForm();
      handleClose();
    },
  });
//   {
//     "id": "3017c268-3866-415b-ad01-0ba361a9b618",
//     "name": "dash",
//     "email": null,
//     "phone": "08805601979",
//     "address": "E-903,BRAMHA EXUBERANCE,NIBM ROAD,PUNE",
//     "createdAt": "2026-02-02T07:06:29.448Z"
// }

  const isNewCustomer = formik.values.customerName && !customers.some(c => c.name === formik.values.customerName);

  // --- HELPERS ---
  const calculateTotal = (items: FormItem[]) => {
    return items.reduce((sum, item) => {
      return sum + (item.sellingPrice * item.quantity);
    }, 0);
  };

  // --- PRODUCT ADDER LOGIC ---
  const handleAddItem = () => {
    if (!currentProduct) return;

    const qty = parseFloat(currentQty) || 1;
    const price = currentProduct.sellingPrice || currentProduct.totalCostPrice || 0;

    const newItem: FormItem = {
      productId: currentProduct.id,
      productName: currentProduct.name,
      quantity: qty,
      sellingPrice: price,
    };

    const updatedItems = [...formik.values.items, newItem];
    formik.setFieldValue("items", updatedItems);
    formik.setFieldValue("grandTotal", calculateTotal(updatedItems));
    setCurrentProduct(null);
    setCurrentQty("1");
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = formik.values.items.filter((_, i) => i !== index);
    formik.setFieldValue("items", updatedItems);
    formik.setFieldValue("grandTotal", calculateTotal(updatedItems));
  };

  // --- TABLE LOGIC ---
  const filteredItems = (orders || []).filter((order) => {
    if (statusFilter && order.status !== statusFilter) return false;
    if (customerFilter && !order.customerName.toLowerCase().includes(customerFilter.toLowerCase())) return false;
    if (dateFilter && new Date(order.orderDate).toISOString().split('T')[0] !== dateFilter) return false;
    return true;
  });

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    const {status, message} = await deleteOrderById(deleteId);
    console.log("status", status);
    console.log("message", message);
    if (status === 200) {
      dispatch(deleteOrder(deleteId));
      toast.success("Order deleted");
    } else {
      toast.error(message || "Failed to delete order");
    }
    setLoading(false);
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const columns: ColumnDef<OrderItem, unknown>[] = [
    { header: "Customer", accessorKey: "customerName" },
    {
      header: "Date",
      accessorKey: "orderDate",
      cell: ({ getValue }) => formatDate(getValue() as string)
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const value = row.original.status;
        const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium";
        let colorClasses = "";
        if (value === "PENDING") colorClasses = "bg-[#F0F1FA] text-[#4F5AED]";
        else if (value === "ONGOING") colorClasses = "bg-[#FEF3C7] text-[#B45309]";
        else if (value === "CANCELLED") colorClasses = "bg-[#FAF0F3] text-[#D12953]";
        else if (value === "COMPLETED") colorClasses = "bg-[#E1FCEF] text-[#14804A]";
        return <span className={`${baseClasses} ${colorClasses}`}>{value}</span>;
      },
    },
    {
      header: "Total",
      accessorKey: "grandTotal",
      cell: ({ getValue }) => formatCurrency(getValue() as number)
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        // Changed "space-x-2" to "gap-1"
        <div className="flex items-center gap-1"> 
            <Button
              type="button"
              title="Edit"
              variant="ghost"
              onClick={() => { setEditingItem(row.original); handleOpen(); }}
              className="cursor-pointer inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-100"
              style={{ color: theme.textMuted }}
            >
               <svg
                 className="w-4 h-4"
                 xmlns="http://www.w3.org/2000/svg"
                 fill="none"
                 viewBox="0 0 24 24"
                 stroke="currentColor"
                 strokeWidth="1.8"
               >
                 <path
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L8.25 19.04 4 20l.96-4.25 11.902-11.263Z"
                 />
               </svg>
            </Button>
            <Button
              type="button"
              title="Delete"
              variant="ghost"
              onClick={() => handleDeleteClick(row.original.id)}
              className="cursor-pointer inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-red-50"
              style={{ color: theme.secondary }}
            >
               <svg
                 xmlns="http://www.w3.org/2000/svg"
                 className="w-4 h-4"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 strokeWidth="1.5"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               >
                 <path d="M3 6h18" />
                 <path d="M8 6V4h8v2" />
                 <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                 <path d="M10 11v6" />
                 <path d="M14 11v6" />
               </svg>
            </Button>
        </div>
      ),
    },
  ];

  console.log("orders", orders, customers);
  // --- LOAD INITIAL DATA ---

  const handleCustomerChange = (newInputValue: string) => {
    const existingCustomer = customers.find(c => c.name === newInputValue);
    formik.setFieldValue("customerName", newInputValue)
    formik.setFieldValue("address", existingCustomer ? existingCustomer.address : "");
    formik.setFieldValue("phoneNumber", existingCustomer ? existingCustomer.phone : "");
  }

  const loadInitialData = async() => {
    setLoading(true);
    const [orderRes, productRes, customerRes] = await Promise.all([
      getOrders(),
      getProducts(),
      getCustomers(),
    ]);

    console.log("orderRes", orderRes);
    

    if (orderRes.status === 200) {
      const mappedOrders: OrderItem[] = Array.isArray(orderRes.data) ? orderRes.data.map((data: any) => ({
        id: data.id,
        productIds: data.orderItems?.map((i: any) => i.productId) || [],
        orderItems: data.orderItems || [],
        customerName: data.customerName,
        phoneNumber: data.customer?.phone,
        address: data.customer?.address,
        orderDate: data.orderDate,
        status: data.status,
        grandTotal: data.grandTotal,
      })) : [];
      dispatch(setOrders(mappedOrders));
    }
    if (productRes.status === 200) dispatch(setRecipes(productRes.data));
    if (customerRes.status === 200) dispatch(setCustomers(customerRes.data));
    setLoading(false);
  }
  useEffect(() => {
    loadInitialData();
  }, [dispatch]);

  console.log("formik.values", formik);
  return (
    <div>
      <div className="relative">
        {/* PAGE HEADER */}
        <div className="w-full flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Orders</h2>
          <Button fullWidth={false} className="px-3 py-1 text-sm" onClick={() => { setEditingItem(null); handleOpen(); }} variant="primary">
            Add New Order
          </Button>
        </div>

        {/* FILTERS */}
        <div className="mb-4 rounded-lg border shadow-sm" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
          <div className="px-4 py-2 border-b flex justify-between items-center" style={{ borderColor: theme.border, backgroundColor: theme.surfaceAlt }}>
            <h3 className="text-lg font-semibold" style={{ color: theme.text }}>Filters</h3>
            <Button
              type="button"
              variant="ghost"
              onClick={resetFilters}
              className="text-xs px-2 py-1 h-auto"
              disabled={!statusFilter && !customerFilter && !dateFilter}
            >
              Reset Filters
            </Button>
          </div>
          <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <TextField label="Customer Name" name="customerFilter" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} placeholder="Search customer" containerClassName="w-full" />

            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-left" style={{ color: theme.text }}>Order Date</label>
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full px-3 py-2 border rounded-md text-left outline-none text-sm" style={{ backgroundColor: theme.surfaceAlt, color: theme.text, borderColor: theme.border }} />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-left" style={{ color: theme.text }}>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border rounded-md text-left outline-none text-sm" style={{ backgroundColor: theme.surfaceAlt, color: theme.text, borderColor: theme.border }}>
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        

        {/* TABLE */}
        {loading && !deleteModalOpen && <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[1px]"><Loader /></div>}
        <DataTable columns={columns} data={filteredItems} isLoading={loading && !deleteModalOpen} />
      </div>

      <ConfirmationModal
        open={deleteModalOpen}
        onClose={() => !loading && setDeleteModalOpen(false)}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        primaryActionLabel="Delete"
        secondaryActionLabel="Cancel"
        onPrimaryAction={handleConfirmDelete}
        primaryVariant="danger"
        isLoading={loading}
      />

      {/* --- SIDE DRAWER --- */}
      {mounted && (
        <div className="fixed inset-0 z-[1300] overflow-hidden">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
            onClick={handleClose}
          />

          {/* Drawer Panel */}
          <div className={`fixed inset-y-0 right-0 flex max-w-full pointer-events-none`}>
            <div
              className={`w-screen max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out pointer-events-auto h-full flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
              role="dialog"
            >

              {/* 1. Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingItem ? "Edit Order" : "New Order"}
                </h2>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* 2. Content */}
              <form onSubmit={formik.handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <FormikProvider value={formik}>
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    <div className="px-6 py-6 space-y-8">

                      {/* SECTION: CUSTOMER DETAILS */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Customer Details</h3>
                        <Autocomplete
                          freeSolo
                          options={customers.map(c => c.name)}
                          value={formik.values.customerName}
                          onInputChange={(_, newInputValue) => handleCustomerChange(newInputValue)}
                          renderInput={(params) => (
                            <MuiTextField {...params} label="Customer Name" name="customerName"
                              error={formik.touched.customerName && Boolean(formik.errors.customerName)}
                              helperText={formik.touched.customerName && formik.errors.customerName}
                              required variant="outlined"
                              fullWidth
                              sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '0.5rem', backgroundColor: '#fff' }
                              }}
                            />
                          )}
                        />

                        {isNewCustomer && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                            <TextField label="Phone Number" name="phoneNumber" value={formik.values.phoneNumber} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.phoneNumber && formik.errors.phoneNumber ? formik.errors.phoneNumber : undefined} required containerClassName="w-full" />
                            <TextField label="Address" name="address" value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.address && formik.errors.address ? formik.errors.address : undefined} required containerClassName="w-full" />
                          </div>
                        )}
                      </div>

                      {/* SECTION: PRODUCTS */}
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                        <div className="flex justify-between items-end">
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Order Items</h3>
                          <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                            {formik.values.items.length} items added
                          </span>
                        </div>

                        {/* Product Adder Inputs */}
                        <div className="flex gap-3 items-start">
                          <div className="flex-grow">
                            <Autocomplete
                              options={recipes}
                              getOptionLabel={(option) => option.name}
                              value={currentProduct}
                              onChange={(_, newValue) => setCurrentProduct(newValue)}
                              renderInput={(params) => (
                                <MuiTextField {...params} label="Search Product..." size="small"
                                  sx={{
                                    '& .MuiOutlinedInput-root': { backgroundColor: '#fff', borderRadius: '0.5rem' }
                                  }}
                                />
                              )}
                            />
                          </div>
                          <div className="w-24">
                            <input
                              type="number"
                              min="1"
                              value={currentQty}
                              onChange={(e) => setCurrentQty(e.target.value)}
                              className="w-full px-3 py-[8.5px] border border-gray-300 rounded-lg text-center outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium"
                              placeholder="Qty"
                            />
                          </div>
                          <Button type="button" onClick={handleAddItem} disabled={!currentProduct} fullWidth={false} variant="primary" className="h-[40px] px-4 rounded-lg shadow-sm">
                            Add
                          </Button>
                        </div>

                        {/* Item List */}
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                          {formik.values.items.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                              No products added yet. Use the search bar above.
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500">
                                <div className="col-span-6">ITEM</div>
                                <div className="col-span-2 text-center">QTY</div>
                                <div className="col-span-3 text-right">PRICE</div>
                                <div className="col-span-1"></div>
                              </div>

                              {formik.values.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-50 transition-colors group">
                                  <div className="col-span-6">
                                    <div className="font-medium text-gray-900">{item.productName}</div>
                                    <div className="text-xs text-slate-500">Unit: {formatCurrency(item.sellingPrice)}</div>
                                  </div>
                                  <div className="col-span-2 text-center text-sm font-medium text-gray-700">
                                    {item.quantity}
                                  </div>
                                  <div className="col-span-3 text-right font-semibold text-gray-900">
                                    {formatCurrency(item.quantity * item.sellingPrice)}
                                  </div>
                                  <div className="col-span-1 text-right">
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100">
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Mini Subtotal */}
                          {formik.values.items.length > 0 && (
                            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-right">
                              <span className="text-sm text-slate-500 mr-3">Subtotal:</span>
                              <span className="font-bold text-gray-900">
                                {formatCurrency(formik.values.items.reduce((s, i) => s + (i.sellingPrice * i.quantity), 0))}
                              </span>
                            </div>
                          )}
                        </div>
                        {formik.touched.items && typeof formik.errors.items === 'string' && <p className="text-xs text-red-500 ml-1">{formik.errors.items}</p>}
                      </div>

                      {/* SECTION: LOGISTICS & TOTAL (UPDATED LAYOUT) */}
                      <div className="space-y-4">

                        {/* ROW 1: Date & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Order Date */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-semibold text-gray-700">Order Date</label>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => formik.setFieldValue("orderDate", getFutureDate(0))} className={`text-[10px] px-3 py-1 rounded-full border transition-all ${formik.values.orderDate === getFutureDate(0) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Today</button>
                                <button type="button" onClick={() => formik.setFieldValue("orderDate", getFutureDate(1))} className={`text-[10px] px-3 py-1 rounded-full border transition-all ${formik.values.orderDate === getFutureDate(1) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Tomorrow</button>
                              </div>
                            </div>
                            <input type="date" name="orderDate" value={formik.values.orderDate} onChange={formik.handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                          </div>

                          {/* Status */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Status</label>
                            <select name="status" value={formik.values.status} onChange={formik.handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white h-[42px] mt-auto">
                              <option value="PENDING">Pending</option>
                              <option value="ONGOING">Ongoing</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* ROW 2: Grand Total - Standard Field */}
                        <TextField
                          label="Grand Total (₹)"
                          name="grandTotal"
                          type="number"
                          value={formik.values.grandTotal}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.grandTotal && formik.errors.grandTotal ? formik.errors.grandTotal : undefined}
                          required
                          containerClassName="w-full"
                        />

                      </div>
                    </div>
                  </div>

                  {/* 3. Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                    <Button type="button" fullWidth={false} onClick={handleClose} variant="secondary" disabled={loading} className="px-6">Cancel</Button>
                    <Button type="submit" fullWidth={false} disabled={formik.values.items.length === 0 || loading} variant="primary" loading={loading} className="px-8 shadow-lg shadow-indigo-200">
                      {editingItem ? "Save Changes" : "Create Order"}
                    </Button>
                  </div>
                </FormikProvider>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
