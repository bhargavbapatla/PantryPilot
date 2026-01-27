import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/authContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Button from "../../components/Button";

gsap.registerPlugin(ScrollTrigger, SplitText);

const Landing = () => {
  const navigate = useNavigate();
  const { theme } = useAuth();
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    /* HERO TEXT ANIMATION */
    if (headingRef.current) {
      const split = new SplitText(headingRef.current, { type: "words" });
      gsap.from(split.words, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.08,
      });
    }

    /* FADE-UP SECTIONS */
    gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
          },
        }
      );
    });

    /* HORIZONTAL WORKFLOW SCROLL */
    const panels = gsap.utils.toArray<HTMLElement>(".workflow-panel");

    gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: ".workflow-section",
        pin: true,
        scrub: 1,
        snap: 1 / (panels.length - 1),
        end: () =>
          "+=" +
          (document.querySelector(".workflow-wrapper") as HTMLElement)
            .offsetWidth,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl"
              style={{ backgroundColor: theme.surfaceAlt }}
            >
              🧁
            </div>
            <div>
              <div className="font-semibold">PantryPilot</div>
              <div className="text-sm" style={{ color: theme.textMuted }}>
                Inventory Management
              </div>
            </div>
          </div>

          <Button variant="primary" onClick={() => navigate("/login")}>
            Try for free
          </Button>
        </div>
      </header>

      {/* HERO */}
      <main className="mx-auto max-w-6xl px-4">
        <section className="flex min-h-[70vh] flex-col items-center justify-center gap-12 md:flex-row">
          <div className="fade-up max-w-xl space-y-6">
            <h1
              ref={headingRef}
              className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
            >
              Stay ahead of every ingredient, order, and recipe.
            </h1>
            <p className="text-lg" style={{ color: theme.textMuted }}>
              PantryPilot keeps your inventory accurate in real time and your
              kitchen running smoothly.
            </p>

            <Button
              variant="primary"
              className="px-6 py-3 text-base"
              onClick={() => navigate("/login")}
            >
              Try for free
            </Button>
          </div>

          <div
            className="fade-up w-full max-w-md overflow-hidden rounded-2xl border shadow-xl"
            style={{ borderColor: theme.border }}
          >
            <img
              src="https://images.unsplash.com/photo-1549488344-cab7d6164423?q=80&w=1200&auto=format&fit=crop"
              alt="Home baking ingredients"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        {/* WORKFLOW — HORIZONTAL SCROLL */}
        <section className="workflow-section relative h-screen overflow-hidden">
          <div className="workflow-wrapper flex h-full">
            {/* PANEL 1 */}
            <div className="workflow-panel flex min-w-full flex-col justify-center px-12">
              <img
                src="https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg"
                alt="Organized baking ingredients"
                className="mb-6 h-56 w-full rounded-xl object-cover shadow-md"
              />
              <h2 className="text-3xl font-semibold mb-4">
                A clear flow from purchase order to finished product.
              </h2>
              <p
                className="max-w-md text-lg"
                style={{ color: theme.textMuted }}
              >
                PantryPilot mirrors how your team actually works — no friction,
                no hacks.
              </p>
            </div>

            {/* PANEL 2 */}
            <div className="workflow-panel flex min-w-full flex-col justify-center px-12">
              <img
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                alt="Ingredients laid out for baking"
                className="mb-6 h-56 w-full rounded-xl object-cover shadow-md"
              />
              <span className="text-sm uppercase tracking-wide mb-2">
                Step 1
              </span>
              <h3 className="text-2xl font-semibold mb-2">
                Add inventory
              </h3>
              <p className="max-w-md">
                Capture ingredients with quantities and units in one place.
              </p>
            </div>

            {/* PANEL 3 */}
            <div className="workflow-panel flex min-w-full flex-col justify-center px-12">
              <img
                src="https://images.pexels.com/photos/616404/pexels-photo-616404.jpeg"
                alt="Preparing a baking recipe"
                className="mb-6 h-56 w-full rounded-xl object-cover shadow-md"
              />
              <span className="text-sm uppercase tracking-wide mb-2">
                Step 2
              </span>
              <h3 className="text-2xl font-semibold mb-2">
                Define recipes
              </h3>
              <p className="max-w-md">
                Link ingredients to recipes once — PantryPilot handles the math.
              </p>
            </div>

            {/* PANEL 4 */}
            <div className="workflow-panel flex min-w-full flex-col justify-center px-12">
              <img
                src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg"
                alt="Checking inventory shelves"
                className="mb-6 h-56 w-full rounded-xl object-cover shadow-md"
              />
              <span className="text-sm uppercase tracking-wide mb-2">
                Step 3
              </span>
              <h3 className="text-2xl font-semibold mb-2">
                Track orders
              </h3>
              <p className="max-w-md">
                Inventory updates automatically as orders are fulfilled.
              </p>
            </div>
          </div>
        </section>

        {/* CONTINUE NORMAL SCROLL */}
        <section className="fade-up py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* TEXT SIDE */}
            <div className="space-y-5">
              <h2 className="text-3xl font-semibold">
                Understand your inventory at a glance.
              </h2>

              <p
                className="text-lg"
                style={{ color: theme.textMuted }}
              >
                PantryPilot turns raw stock data into clear signals, so you always
                know what needs attention — before it becomes a problem.
              </p>

              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span>✔</span>
                  <span>Instant visibility into low-stock ingredients</span>
                </li>
                <li className="flex gap-2">
                  <span>✔</span>
                  <span>See which recipes consume the most inventory</span>
                </li>
                <li className="flex gap-2">
                  <span>✔</span>
                  <span>Make confident purchasing decisions with real data</span>
                </li>
              </ul>

              <Button
                variant="primary"
                className="mt-4 w-fit px-6 py-3 text-sm"
                onClick={() => navigate("/login")}
              >
                View insights
              </Button>
            </div>

            {/* IMAGE SIDE */}
            <div
              className="overflow-hidden rounded-2xl border shadow-xl"
              style={{ borderColor: theme.border }}
            >
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1400&auto=format&fit=crop"
                alt="Inventory insights and planning overview"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>
      <footer
        className="w-full border-t"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.surfaceAlt,
        }}
      >
        {/* INNER CONTENT CONTAINER */}
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">

            {/* BRAND */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.primary,
                  }}
                >
                  🧁
                </div>
                <span className="font-semibold">PantryPilot</span>
              </div>
              <p
                className="text-sm"
                style={{ color: theme.textMuted }}
              >
                Inventory management built for home bakers and small kitchens.
                Stay in control from ingredient to order.
              </p>
            </div>

            {/* PRODUCT */}
            <div>
              <p className="mb-3 text-lg font-semibold">Product</p>
              <ul className="space-y-2 text-sm">
                <li className="cursor-pointer hover:underline">Features</li>
                <li className="cursor-pointer hover:underline">Workflow</li>
                <li className="cursor-pointer hover:underline">Insights</li>
              </ul>
            </div>

            {/* COMPANY */}
            <div>
              <p className="mb-3 text-sm font-semibold">Company</p>
              <ul className="space-y-2 text-sm">
                <li className="cursor-pointer hover:underline">About</li>
                <li className="cursor-pointer hover:underline">Contact</li>
                <li className="cursor-pointer hover:underline">Support</li>
              </ul>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <p className="text-lg font-semibold">Get started</p>
              <p
                className="text-sm"
                style={{ color: theme.textMuted }}
              >
                Start tracking inventory in minutes. No credit card required.
              </p>
              <Button
                variant="primary"
                className="w-fit px-4 py-2 text-sm"
                onClick={() => navigate("/login")}
              >
                Try for free
              </Button>
            </div>
          </div>
        </div>

        {/* FULL-WIDTH BOTTOM BAR */}
        <div
          className="w-full border-t"
          style={{ borderColor: theme.border }}
        >
          <div
            className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between"
            style={{ color: theme.textMuted }}
          >
            <p>
              © {new Date().getFullYear()} PantryPilot. All rights reserved.
            </p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:underline">
                Privacy
              </span>
              <span className="cursor-pointer hover:underline">
                Terms
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
