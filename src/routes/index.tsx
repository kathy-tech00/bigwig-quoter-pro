import { createFileRoute } from "@tanstack/react-router";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Instagram,
  LayoutDashboard,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Send,
  Settings,
  Share2,
  Sun,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getSavedQuotations,
  saveDraft,
  updateDraft,
  saveQuotation,
  updateQuotation,
  type StoredQuotation,
} from "@/services/quotation-service";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "B.A.B.C Quotation Studio" },
      {
        name: "description",
        content: "Create construction quotations, invoices, and track payments in NGN and USD.",
      },
      { property: "og:title", content: "B.A.B.C Quotation Studio" },
      { property: "og:description", content: "Professional quotation management for B.A.B.C." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuotationApp,
});

type Item = { id: number; description: string; unit: string; quantity: number; rate: number };
type View = "dashboard" | "quotes" | "invoices" | "payments" | "clients" | "settings";

const services = [
  "Architectural drawing & approvals",
  "Site clearing and setting out",
  "Reinforced concrete foundation",
  "Blockwork and structural frame",
  "Roofing and rainwater system",
  "Electrical and plumbing installation",
  "Finishes and handover",
];
const DEFAULT_WHATSAPP = "+2349067883721";
const QUOTATION_TEMPLATE_NOTE =
  "This quotation is valid for 14 days. Work commences upon receipt of the required deposit. Variations will be quoted separately.";

const waitForImagesToLoad = async (node: HTMLElement) => {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.onload = () => resolve();
          image.onerror = () => resolve();
        }),
    ),
  );
};

// Load quotations from storage
function getStoredQuotationsForDisplay() {
  const quotations = getSavedQuotations();
  return quotations.map((q) => ({
    id: q.id,
    number: q.quotationNumber,
    client: q.client.name,
    project: q.title,
    amount: q.total,
    status: q.status.charAt(0).toUpperCase() + q.status.slice(1),
    date: new Date(q.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));
}

const money = (value: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(value);

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
};

const getCurrentDate = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* Premium BW Logo with floating effect */}
      <div className="relative animate-float shrink-0">
        {/* Logo background glow */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-400/30 to-blue-600/20 blur-lg" />

        {/* Logo image */}
        <img
          src="/B.A.B.C LOGO.png"
          alt="B.A.B.C Logo"
          className="relative size-11 rounded-lg shadow-lg glow-primary object-contain"
        />
      </div>

      {!compact && (
        <div className="animate-fade-in">
          <p className="font-brand text-sm font-bold leading-none text-foreground">B.A.B.C</p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            From Vision to Legacy
          </p>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "Accepted" || status === "Paid"
      ? "bg-success/10 text-success"
      : status === "Sent"
        ? "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "status-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
        styles,
      )}
    >
      <span className="status-pill-dot size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function QuotationApp() {
  const [view, setView] = useState<View>("dashboard");
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notice, setNotice] = useState("");
  const [currentQuotationId, setCurrentQuotationId] = useState<string | null>(null);
  const [currency, setCurrency] = useState("NGN");
  const [client, setClient] = useState({ name: "", company: "", phone: "", address: "" });
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("percentage");
  const [depositPct, setDepositPct] = useState(40);
  const [exchangeRate, setExchangeRate] = useState(1600);
  const [items, setItems] = useState<Item[]>([]);
  const [savedQuotations, setSavedQuotations] = useState<StoredQuotation[]>([]);
  const documentRef = useRef<HTMLDivElement>(null);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.rate, 0),
    [items],
  );
  const appliedDiscount = useMemo(() => {
    if (discountType === "percentage") {
      return Math.max(0, subtotal * (discount / 100));
    }
    return Math.max(0, discount);
  }, [discount, discountType, subtotal]);
  const total = Math.max(0, subtotal - appliedDiscount);
  const deposit = total * (depositPct / 100);
  const converted = currency === "NGN" ? total / exchangeRate : total * exchangeRate;

  const refreshSavedQuotations = () => setSavedQuotations(getSavedQuotations());

  useEffect(() => {
    refreshSavedQuotations();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "babc_quotations") refreshSavedQuotations();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("babc-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setIsDarkMode(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("babc-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // Auto-save draft every 30 seconds when editing
  useEffect(() => {
    if (!title || items.length === 0) return;

    const interval = setInterval(() => {
      const draftData = {
        quotationNumber: currentQuotationId || "DRAFT-" + Date.now(),
        title,
        client,
        items,
        currency,
        discount,
        discountType,
        depositPct,
        exchangeRate,
        subtotal,
        total,
        status: "draft" as const,
      };

      if (currentQuotationId?.startsWith("draft_")) {
        updateDraft(currentQuotationId, draftData);
      } else if (currentQuotationId) {
        updateQuotation(currentQuotationId, { ...draftData, status: "sent" });
        refreshSavedQuotations();
      } else {
        const saved = saveDraft(draftData);
        setCurrentQuotationId(saved.id);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [
    title,
    client,
    items,
    currency,
    discount,
    discountType,
    depositPct,
    exchangeRate,
    subtotal,
    total,
    currentQuotationId,
  ]);

  // Save quotation function
  const saveCurrentQuotation = () => {
    if (!title || items.length === 0 || !client.name) {
      notify("Please fill in all required fields");
      return;
    }

    const quotationData = {
      quotationNumber: currentQuotationId
        ? (getSavedQuotations().find((quotation) => quotation.id === currentQuotationId)
            ?.quotationNumber ?? `BABC-Q-${String(savedQuotations.length + 1).padStart(4, "0")}`)
        : `BABC-Q-${String(savedQuotations.length + 1).padStart(4, "0")}`,
      title,
      client,
      items,
      currency,
      discount,
      discountType,
      depositPct,
      exchangeRate,
      subtotal,
      total,
      status: "sent" as const,
    };

    const saved =
      currentQuotationId && !currentQuotationId.startsWith("draft_")
        ? updateQuotation(currentQuotationId, quotationData)
        : saveQuotation(quotationData);
    if (!saved) {
      notify("Unable to save quotation. Please try again.");
      return;
    }
    console.log("✓ Quotation saved:", saved);
    refreshSavedQuotations();
    setCurrentQuotationId(saved.id);
    setPreviewOpen(false); // Close preview if open
    setEditorOpen(false); // Close editor after saving
    notify("✓ Quotation saved successfully!");
  };

  // Create new quotation
  const newQuotation = () => {
    setCurrentQuotationId(null);
    setTitle("");
    setClient({ name: "", company: "", phone: "", address: "" });
    setItems([]);
    setCurrency("NGN");
    setDiscount(0);
    setDiscountType("percentage");
    setEditorOpen(true);
    notify("New quotation created");
  };
  const editQuotation = (quotation: StoredQuotation) => {
    setCurrentQuotationId(quotation.id);
    setTitle(quotation.title);
    setClient(quotation.client);
    setItems(quotation.items);
    setCurrency(quotation.currency);
    setDiscount(quotation.discount ?? 0);
    setDiscountType(quotation.discountType ?? "percentage");
    setDepositPct(quotation.depositPct);
    setExchangeRate(quotation.exchangeRate);
    setEditorOpen(true);
    setPreviewOpen(false);
    notify(`Editing ${quotation.quotationNumber}`);
  };
  const updateItem = (id: number, key: keyof Item, value: string | number) =>
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  const addItem = () =>
    setItems((current) => [
      ...current,
      {
        id: Date.now(),
        description: services[4] ?? "New construction item",
        unit: "lump sum",
        quantity: 1,
        rate: 0,
      },
    ]);
  const notify = (message: string) => setNotice(message);
  const exportJpeg = async () => {
    if (!documentRef.current) return;
    await waitForImagesToLoad(documentRef.current);
    const data = await toJpeg(documentRef.current, {
      quality: 0.96,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
    const link = document.createElement("a");
    link.download = "BABC-Q-0029.jpg";
    link.href = data;
    link.click();
    notify("JPEG ready for WhatsApp");
  };
  const exportPdf = async () => {
    if (!documentRef.current) return;
    await waitForImagesToLoad(documentRef.current);
    const data = await toJpeg(documentRef.current, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
    const pdf = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
    pdf.addImage(data, "JPEG", 0, 0, 148, 210);
    pdf.save("BABC-Q-0029.pdf");
    notify("A5 PDF downloaded");
  };
  const shareWhatsApp = () => {
    const whatsappNumber = (client.phone || DEFAULT_WHATSAPP).replace(/\D/g, "");
    const text = encodeURIComponent(
      `Hello ${client.name || "there"}, your B.A.B.C quotation ${currentQuotationId || "BABC-Q-0029"} for ${title || "your project"} is ready. Total: ${money(total, currency)}.`,
    );
    window.open(
      `https://wa.me/${whatsappNumber}?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const nav = [
    ["dashboard", LayoutDashboard, "Overview"],
    ["quotes", FileText, "Quotations"],
    ["invoices", ReceiptText, "Invoices"],
    ["payments", CircleDollarSign, "Payments"],
    ["clients", Users, "Clients"],
    ["settings", Settings, "Settings"],
  ] as const;

  return (
    <div className="app-shell min-h-screen bg-background text-foreground">
      {notice && (
        <div className="notice-toast fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-md bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl">
          <Check className="mr-2 inline size-4" />
          {notice}
        </div>
      )}
      <aside
        className={cn(
          "sidebar-shell fixed inset-y-0 left-0 z-50 w-64 overflow-hidden border-r border-border bg-card px-4 py-5 transition-transform lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2">
          <BrandMark />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </Button>
        </div>
        <nav className="mt-10 space-y-1">
          {nav.map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => {
                setView(id);
                setMenuOpen(false);
              }}
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-smooth",
                view === id
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg glow-primary"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:shadow-md",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 border-t border-border pt-4">
          <p className="text-xs font-bold">Engr. K.I Hillary</p>
          <p className="text-[11px] text-muted-foreground">Super Admin</p>
        </div>
      </aside>
      <main className="min-w-0 overflow-x-hidden lg:pl-64">
        <header className="topbar sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden transition-smooth hover:bg-accent"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </Button>
            <div className="animate-fade-in">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Quotation Studio
              </p>
              <p className="font-brand text-sm font-bold">B.A.B.C</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle theme"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setIsDarkMode((value) => !value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-smooth",
                isDarkMode
                  ? "border-border bg-card text-foreground shadow-sm"
                  : "border-primary/20 bg-primary/5 text-primary shadow-sm",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border",
                  isDarkMode
                    ? "border-amber-300 bg-amber-100 text-amber-700"
                    : "border-slate-200 bg-slate-900 text-slate-100",
                )}
              >
                {isDarkMode ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              </span>
              <span>{isDarkMode ? "Night" : "Day"}</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="transition-smooth hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell />
            </Button>
            <Button
              variant="gold"
              onClick={newQuotation}
              className="transition-smooth glow-primary-hover shadow-md"
            >
              <Plus /> New quotation
            </Button>
          </div>
        </header>

        {view === "dashboard" && (
          <Dashboard
            quotations={savedQuotations}
            onCreate={newQuotation}
            onView={() => setView("quotes")}
            onEdit={editQuotation}
          />
        )}
        {view === "quotes" && (
          <Quotations quotations={savedQuotations} onCreate={newQuotation} onEdit={editQuotation} />
        )}
        {view === "invoices" && (
          <EmptyView
            icon={ReceiptText}
            title="Invoices"
            text="Accepted quotations become trackable invoices here."
            action="Create from quotation"
            onAction={() => setView("quotes")}
          />
        )}
        {view === "payments" && (
          <EmptyView
            icon={CircleDollarSign}
            title="Payment tracking"
            text="Record deposits and balances in Naira or US Dollars."
            action="View invoices"
            onAction={() => setView("invoices")}
          />
        )}
        {view === "clients" && <Clients />}
        {view === "settings" && (
          <SettingsView
            exchangeRate={exchangeRate}
            setExchangeRate={setExchangeRate}
            notify={notify}
          />
        )}
      </main>

      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/35 backdrop-blur-sm">
          <div className="absolute inset-y-0 right-0 flex w-full max-w-4xl flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase text-primary">
                  {currentQuotationId ? "Edit quotation" : "New quotation"}
                </p>
                <h2 className="font-brand text-xl font-bold">
                  {currentQuotationId ? "Edit quotation" : "New quotation"}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditorOpen(false)}
                aria-label="Close editor"
              >
                <X />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-8">
              <div className="grid gap-8 xl:grid-cols-[1fr_270px]">
                <div className="space-y-8">
                  <section>
                    <SectionTitle number="01" title="Client & project" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Client name"
                        value={client.name}
                        onChange={(v) => setClient({ ...client, name: v })}
                      />
                      <Field
                        label="Company name"
                        value={client.company}
                        onChange={(v) => setClient({ ...client, company: v })}
                      />
                      <Field
                        label="Phone number"
                        value={client.phone}
                        onChange={(v) => setClient({ ...client, phone: v })}
                      />
                      <Field
                        label="Project address"
                        value={client.address}
                        onChange={(v) => setClient({ ...client, address: v })}
                      />
                      <div className="sm:col-span-2">
                        <Field label="Quotation title" value={title} onChange={setTitle} />
                      </div>
                    </div>
                  </section>
                  <section>
                    <div className="flex items-center justify-between">
                      <SectionTitle number="02" title="Scope & pricing" />
                      <Button variant="outline" size="sm" onClick={addItem}>
                        <Plus /> Add item
                      </Button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {items.map((item, i) => (
                        <div
                          key={item.id}
                          className="grid gap-2 border-b border-border pb-4 sm:grid-cols-[28px_1fr_80px_120px_36px]"
                        >
                          <span className="pt-2 text-xs font-bold text-muted-foreground">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            aria-label={`Item ${i + 1} description`}
                          />
                          <Input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, "quantity", Number(e.target.value))
                            }
                            aria-label="Quantity"
                          />
                          <Input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                            aria-label="Rate"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setItems((list) => list.filter((x) => x.id !== item.id))}
                            aria-label="Remove item"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <SectionTitle number="03" title="Terms & notes" />
                    <Textarea
                      defaultValue="This quotation is valid for 14 days. Work commences upon receipt of the required deposit. Variations will be quoted separately."
                      rows={4}
                    />
                  </section>
                </div>
                <aside className="space-y-5">
                  <div>
                    <Label>Document currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">NGN — Nigerian Naira</SelectItem>
                        <SelectItem value="USD">USD — US Dollars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field
                    label="Exchange rate (₦ / $)"
                    value={String(exchangeRate)}
                    type="number"
                    onChange={(v) => setExchangeRate(Number(v))}
                  />
                  <div className="space-y-2">
                    <Label>Discount type</Label>
                    <Select
                      value={discountType}
                      onValueChange={(value) => setDiscountType(value as "fixed" | "percentage")}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed value</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field
                    label={
                      discountType === "percentage"
                        ? "Discount (%)"
                        : `Discount (${currency})`
                    }
                    value={String(discount)}
                    type="number"
                    onChange={(v) => setDiscount(Number(v))}
                  />
                  <Field
                    label="Deposit required (%)"
                    value={String(depositPct)}
                    type="number"
                    onChange={(v) => setDepositPct(Number(v))}
                  />
                  <div className="border-t border-border pt-5">
                    <SummaryRow label="Subtotal" value={money(subtotal, currency)} />
                    <SummaryRow
                      label="Discount"
                      value={`− ${money(appliedDiscount, currency)}`}
                    />
                    <div className="mt-4 bg-primary p-4 text-primary-foreground">
                      <p className="text-xs font-semibold opacity-70">Grand total</p>
                      <p className="mt-1 text-xl font-bold">{money(total, currency)}</p>
                      <p className="mt-2 text-xs opacity-80">
                        ≈ {money(converted, currency === "NGN" ? "USD" : "NGN")}
                      </p>
                    </div>
                    <SummaryRow
                      label={`Deposit (${depositPct}%)`}
                      value={money(deposit, currency)}
                    />
                    <SummaryRow label="Outstanding" value={money(total - deposit, currency)} />
                  </div>
                </aside>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-card px-5 py-4 sm:px-8">
              <Button variant="outline" onClick={newQuotation}>
                <Plus /> New quotation
              </Button>
              <Button variant="secondary" onClick={() => notify("Draft auto-saved")}>
                <Clock3 /> Auto-saving
              </Button>
              <Button
                onClick={() => {
                  saveCurrentQuotation();
                  setPreviewOpen(true);
                }}
              >
                <FileCheck2 /> Save & Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-foreground/70 p-3 sm:p-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center">
            <div className="no-print mb-4 flex w-full flex-wrap justify-between gap-2">
              <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
                <X /> Close
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => window.print()}>
                  <Printer /> Print A5
                </Button>
                <Button variant="secondary" onClick={exportPdf}>
                  <Download /> PDF
                </Button>
                <Button variant="secondary" onClick={exportJpeg}>
                  <Download /> JPEG
                </Button>
                <Button variant="gold" onClick={shareWhatsApp}>
                  <Share2 /> WhatsApp
                </Button>
              </div>
            </div>
            <QuoteDocument
              ref={documentRef}
              client={client}
              title={title}
              items={items}
              currency={currency}
              subtotal={subtotal}
              discount={discount}
              total={total}
              deposit={deposit}
              converted={converted}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({
  quotations,
  onCreate,
  onView,
  onEdit,
}: {
  quotations: StoredQuotation[];
  onCreate: () => void;
  onView: () => void;
  onEdit: (quotation: StoredQuotation) => void;
}) {
  const totalValue = quotations.reduce((sum, q) => sum + q.total, 0);
  const acceptedAmount = quotations
    .filter((q) => q.status === "accepted")
    .reduce((sum, q) => sum + q.total, 0);
  const acceptedCount = quotations.filter((q) => q.status === "accepted").length;
  const paidAmount = quotations
    .filter((q) => q.status === "paid")
    .reduce((sum, q) => sum + q.total, 0);
  const outstandingAmount = quotations
    .filter((q) => q.status !== "paid")
    .reduce((sum, q) => sum + (q.total - q.total * (q.depositPct / 100)), 0);

  const stats = [
    ["Total quotations", money(totalValue), `${quotations.length} quotes`, FileText],
    ["Accepted", money(acceptedAmount), `${acceptedCount} deals`, FileCheck2],
    [
      "Payments received",
      money(paidAmount),
      quotations.filter((q) => q.status === "paid").length + " paid",
      CircleDollarSign,
    ],
    ["Outstanding", money(outstandingAmount), "Awaiting payment", Clock3],
  ] as const;
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="animate-slide-up">
          <p className="text-xs font-bold uppercase text-highlight">{getCurrentDate()}</p>
          <h1 className="mt-2 font-brand text-3xl font-bold sm:text-4xl">
            {getTimeGreeting()}, Hillary.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Your business at a glance.</p>
        </div>
        <Button onClick={onCreate} className="transition-smooth glow-primary-hover">
          <Plus /> Create quotation
        </Button>
      </div>
      <div className="mt-8 stats-grid grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 xl:grid-cols-4 shadow-lg">
        {stats.map(([label, value, meta, Icon], idx) => (
          <div
            key={label}
            className="surface-card bg-card p-5 transition-smooth hover:shadow-lg hover:translate-y-[-2px] animate-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-5 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs font-semibold text-success">{meta}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="surface-card min-w-0 bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-brand font-bold">Recent quotations</h2>
              <p className="mt-1 text-xs text-muted-foreground">Latest client activity</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              className="transition-smooth hover:translate-x-1"
            >
              View all <ChevronRight />
            </Button>
          </div>
          <QuoteTable quotations={quotations} onEdit={onEdit} />
        </section>
        <section className="performance-card min-w-0 bg-gradient-to-br from-primary to-primary/90 p-6 text-primary-foreground rounded-lg shadow-lg">
          <p className="text-xs font-bold uppercase text-highlight">September performance</p>
          <h2 className="mt-3 font-brand text-2xl font-bold">61.6% acceptance rate</h2>
          <div className="mt-8 flex h-36 items-end gap-3">
            {[32, 55, 43, 78, 62, 91, 70].map((v, i) => (
              <div
                key={i}
                className="flex h-full flex-1 items-end bg-primary-foreground/10 rounded-t hover:bg-primary-foreground/20 transition-smooth"
              >
                <div className="w-full bg-highlight rounded-t" style={{ height: `${v}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] opacity-70">
            <span>Week 1</span>
            <span>Week 4</span>
          </div>
          <div className="mt-7 border-t border-primary-foreground/20 pt-5">
            <p className="text-xs opacity-70">Next expiring quotation</p>
            <p className="mt-1 text-sm font-semibold">BABC-Q-0027 · in 4 days</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function QuoteTable({
  quotations,
  onEdit,
}: {
  quotations: StoredQuotation[];
  onEdit: (quotation: StoredQuotation) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left">
        <thead>
          <tr className="text-[10px] uppercase text-muted-foreground">
            {["Number / Client", "Project", "Amount", "Status", "Date", ""].map((x) => (
              <th key={x} className="px-5 py-3 font-bold">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quotations.map((q) => (
            <tr key={q.id} className="table-row-interactive border-t border-border text-sm">
              <td className="px-5 py-4">
                <p className="font-bold">{q.quotationNumber}</p>
                <p className="text-xs text-muted-foreground">{q.client.name}</p>
              </td>
              <td className="px-5 py-4 text-xs">{q.title}</td>
              <td className="px-5 py-4 font-bold">{money(q.total, q.currency)}</td>
              <td className="px-5 py-4">
                <StatusPill status={q.status.charAt(0).toUpperCase() + q.status.slice(1)} />
              </td>
              <td className="px-5 py-4 text-xs text-muted-foreground">
                {new Date(q.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-5 py-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(q)}
                  aria-label={`Edit ${q.quotationNumber}`}
                >
                  <Settings />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Quotations({
  quotations,
  onCreate,
  onEdit,
}: {
  quotations: StoredQuotation[];
  onCreate: () => void;
  onEdit: (quotation: StoredQuotation) => void;
}) {
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-highlight">Documents</p>
          <h1 className="mt-2 font-brand text-3xl font-bold">Quotations</h1>
        </div>
        <Button onClick={onCreate}>
          <Plus /> New quotation
        </Button>
      </div>
      <div className="mt-8 flex gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search quotation, client or project" />
        </div>
      </div>
      <div className="mt-5 bg-card">
        <QuoteTable quotations={quotations} onEdit={onEdit} />
      </div>
    </div>
  );
}

function Clients() {
  const quotes = getStoredQuotationsForDisplay();
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <p className="text-xs font-bold uppercase text-highlight animate-fade-in">Relationships</p>
      <h1 className="mt-2 font-brand text-3xl font-bold">Clients</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quotes.slice(0, 3).map((q, i) => (
          <div
            className="border border-border bg-card p-5 rounded-lg shadow-md transition-smooth hover:shadow-xl hover:translate-y-[-4px] animate-scale-in"
            key={q.client}
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="grid size-11 place-items-center bg-gradient-to-br from-primary to-primary/80 font-brand font-bold text-primary-foreground rounded-lg">
                {q.client.charAt(0)}
              </div>
              <StatusPill status={i === 0 ? "Active" : "Lead"} />
            </div>
            <h2 className="mt-5 font-bold">{q.client}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{q.project}</p>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">Lifetime value</span>
              <strong className="text-sm">{money(q.amount)}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({
  exchangeRate,
  setExchangeRate,
  notify,
}: {
  exchangeRate: number;
  setExchangeRate: (n: number) => void;
  notify: (s: string) => void;
}) {
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <p className="text-xs font-bold uppercase text-highlight animate-fade-in">Administration</p>
      <h1 className="mt-2 font-brand text-3xl font-bold">Company settings</h1>
      <div className="mt-8 grid gap-8 bg-card p-5 sm:p-8 rounded-lg shadow-lg">
        <section>
          <SectionTitle number="01" title="Business profile" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Company name"
              value="B.A.B.C BIG-WIG ARCHITECTURE AND BUILDING CONSTRUCTION COMPANY"
              onChange={() => {}}
            />
            <Field label="Registration number" value="7051820" onChange={() => {}} />
            <Field label="Official email" value="destinybigwig@gmail.com" onChange={() => {}} />
            <Field label="Phone" value="+2349067883721" onChange={() => {}} />
          </div>
        </section>
        <section>
          <SectionTitle number="02" title="Documents & currency" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Default NGN / USD rate"
              type="number"
              value={String(exchangeRate)}
              onChange={(v) => setExchangeRate(Number(v))}
            />
            <Field label="Default validity (days)" type="number" value="14" onChange={() => {}} />
          </div>
        </section>
        <section>
          <SectionTitle number="03" title="Payment accounts" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-border p-4 rounded-lg transition-smooth hover:shadow-md">
              <strong className="text-sm">Nigerian Naira · UBA</strong>
              <p className="mt-2 text-sm">BIG WIG ARCHITECTURE AND BUILDING CONSTRUCTION</p>
              <p className="mt-1 font-bold">1031019964</p>
            </div>
            <div className="border border-border p-4 rounded-lg transition-smooth hover:shadow-md">
              <strong className="text-sm">US Dollars · UBA</strong>
              <p className="mt-2 text-sm">Kwamu Hilary Ifechukwudere</p>
              <p className="mt-1 font-bold">2380556018</p>
              <p className="mt-1 text-xs text-muted-foreground">SWIFT UNAFNGLA · Sort 033250380</p>
            </div>
          </div>
        </section>
        <Button
          className="w-fit transition-smooth glow-primary-hover"
          onClick={() => notify("Company settings saved")}
        >
          Save settings
        </Button>
      </div>
    </div>
  );
}

function EmptyView({
  icon: Icon,
  title,
  text,
  action,
  onAction,
}: {
  icon: typeof FileText;
  title: string;
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-16 place-items-center bg-primary/10 text-primary">
          <Icon className="size-7" />
        </div>
        <h1 className="mt-6 font-brand text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{text}</p>
        <Button className="mt-6" onClick={onAction}>
          {action}
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="text-xs font-bold text-highlight">{number}</span>
      <h3 className="font-brand text-sm font-bold">{title}</h3>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        className="mt-2"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const QuoteDocument = forwardRef<
  HTMLDivElement,
  {
    client: { name: string; company: string; phone: string; address: string };
    title: string;
    items: Item[];
    currency: string;
    subtotal: number;
    discount: number;
    discountType: "fixed" | "percentage";
    total: number;
    deposit: number;
    converted: number;
  }
>(
  (
    { client, title, items, currency, subtotal, discount, discountType, total, deposit, converted },
    ref,
  ) => {
    const effectiveDiscount =
      discountType === "percentage" ? Math.max(0, subtotal * (discount / 100)) : Math.max(0, discount);
    const whatsappNumber = (client.phone || DEFAULT_WHATSAPP).replace(/\D/g, "");
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `Hello ${client.name || "there"}, I would like to discuss your quotation for ${title || "the project"}.`,
    )}`;

    return (
      <div
        ref={ref}
        className="print-document relative w-[148mm] min-h-[210mm] bg-white p-[10.5mm] text-[#1d1d1d] shadow-2xl"
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.06]">
          <img
            src="/B.A.B.C LOGO.png"
            alt="watermark"
            className="size-[220px] object-contain"
            crossOrigin="anonymous"
          />
        </div>

        <div className="relative z-10">
          <header className="flex items-start justify-between border-b-[2px] border-[#f4a300] pb-2.5">
            <div className="flex items-center gap-3">
              <img
                src="/B.A.B.C LOGO.png"
                alt="B.A.B.C logo"
                className="h-[52px] w-[52px] object-contain"
                crossOrigin="anonymous"
              />
              <div className="pt-1">
                <p className="font-[Georgia] text-[9px] font-bold uppercase tracking-[0.18em] text-[#0b3d9a] leading-tight">
                  BIG-WIG ARCHITECTURE AND BUILDING CONSTRUCTION COMPANY
                </p>
                <p className="mt-1 text-[7px] text-[#4b5563]">
                  No. 5 Benbella Street, Umuchima Uli, Anambra State.
                </p>
              </div>
            </div>
            <div className="pt-1 text-right text-[7px] leading-[1.5] text-[#4b5563]">
              <p className="font-bold text-[#0b3d9a]">+2349067883721 | destinybigwig@gmail.com</p>
              <p>https://babcofficialsite.vercel.app</p>
            </div>
          </header>

          <div className="mt-4 flex items-start justify-between gap-4 border-b border-[#d7d2c7] pb-2.5">
            <div className="space-y-1">
              <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#0b3d9a]">
                Formal document
              </p>
              <p className="text-[24px] font-black leading-none text-[#0b3d9a]">QUOTATION</p>
            </div>
            <div className="pt-1 text-right text-[7px] leading-[1.5] text-[#4b5563]">
              <p>Issued: 07 Sept 2026</p>
              <p>Valid until: 22 Sept 2026</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1.2fr_1fr] gap-3">
            <div className="rounded-[3px] border border-[#f4a300] bg-[#eef4ff] p-3">
              <div className="flex items-start gap-2.5">
                <div className="h-12 w-[2px] bg-[#f4a300]" />
                <div className="min-w-0">
                  <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-[#0b3d9a]">
                    Prepared for
                  </p>
                  <p className="mt-1 text-[16px] font-black leading-none text-[#0b3d9a]">
                    {client.name || "Client name"}
                  </p>
                  <p className="mt-1 text-[7px] leading-[1.5] text-[#4b5563]">
                    {client.company || "Company name"}
                    <br />
                    {client.phone || "+2340000000000"}
                    <br />
                    {client.address || "Project address"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[3px] border border-[#d7d2c7] bg-[#f8fafc] p-3">
              <div className="flex items-start gap-2.5">
                <div className="h-12 w-[2px] bg-[#f4a300]" />
                <div className="w-full min-w-0">
                  <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-[#0b3d9a]">
                    Project
                  </p>
                  <p className="mt-1 text-[15px] font-black leading-none text-[#0b3d9a] truncate">
                    {title || "Construction quotation"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[3px] border border-[#0b3d9a]">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#0b3d9a] text-[#ffffff]">
                <tr className="text-[7px] uppercase tracking-[0.12em]">
                  <th className="p-2 font-bold">#</th>
                  <th className="p-2 font-bold">Description</th>
                  <th className="p-2 text-center font-bold">Unit price</th>
                  <th className="p-2 text-center font-bold">Qty</th>
                  <th className="p-2 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((i, idx) => (
                    <tr key={i.id} className="border-t border-[#dfe3e8] bg-white text-[9px]">
                      <td className="p-2 font-bold text-[#0b3d9a]">{String(idx + 1).padStart(2, "0")}</td>
                      <td className="p-2">
                        <div className="font-bold text-[#0b3d9a]">{i.description || "Untitled item"}</div>
                        <div className="mt-0.5 text-[7px] text-[#64748b]">{i.unit || "lump sum"}</div>
                      </td>
                      <td className="p-2 text-center text-[#0b3d9a]">{money(i.rate, currency)}</td>
                      <td className="p-2 text-center text-[#0b3d9a]">{i.quantity}</td>
                      <td className="p-2 text-right font-bold text-[#0b3d9a]">
                        {money(i.rate * i.quantity, currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="bg-white p-6 text-center text-[10px] text-[#64748b]">
                      No items added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-[1.15fr_0.85fr] gap-4">
            <div className="space-y-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#0b3d9a]">
                Payment details
              </p>
              <div className="text-[9px] leading-[1.55] text-[#1f2937]">
                <p className="font-bold">Naira Payments (NGN)</p>
                <p className="mt-1">BIG WIG ARCHITECTURE AND BUILDING CONSTRUCTION</p>
                <p>UBA · 1031019964</p>
              </div>
              <div className="mt-3 text-[9px] leading-[1.55] text-[#1f2937]">
                <p className="font-bold">Dollar Payments (USD)</p>
                <p className="mt-1">Kwamu Hilary Ifechukwudere</p>
                <p>UBA · 2380556018</p>
                <p>SWIFT CODE: UNAFNGLA</p>
                <p>Sort Code: 033250380</p>
              </div>
              <p className="text-[8px] text-[#4b5563]">Amount in words: zero naira</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between border-b border-[#d7d2c7] py-1 text-[9px] text-[#4b5563]">
                <span>Subtotal</span>
                <strong className="text-[#1f2937]">{money(subtotal, currency)}</strong>
              </div>
              <div className="flex justify-between border-b border-[#d7d2c7] py-1 text-[9px] text-[#4b5563]">
                <span>Discount</span>
                <strong className="text-[#1f2937]">- {money(effectiveDiscount, currency)}</strong>
              </div>
              <div className="bg-[#0b3d9a] p-2.5 text-[#ffffff]">
                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.12em]">
                  <span>Grand total</span>
                  <span>{money(total, currency)}</span>
                </div>
                <div className="mt-1 text-right text-[8px] text-[#dbeafe]">
                  Equivalent: {money(converted, currency === "NGN" ? "USD" : "NGN")}
                </div>
              </div>
              <div className="flex justify-between border-b border-[#d7d2c7] py-1 text-[9px] text-[#4b5563]">
                <span>Deposit (50%)</span>
                <strong className="text-[#1f2937]">{money(deposit, currency)}</strong>
              </div>
              <div className="flex justify-between py-1 text-[9px] text-[#4b5563]">
                <span>Outstanding</span>
                <strong className="text-[#1f2937]">{money(total - deposit, currency)}</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[3px] border border-dashed border-[#f4a300] bg-[#fff8ee] p-2.5 text-[7px] leading-[1.5] text-[#374151]">
            <p className="mb-1 text-[7px] font-bold uppercase tracking-[0.16em] text-[#0b3d9a]">
              Terms & conditions
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div>1. Prices cover only the listed scope of work.</div>
              <div>2. Changes require written approval and may change the cost.</div>
              <div>3. A deposit is required before work begins.</div>
              <div>4. Payment follows the currency shown on this document.</div>
              <div>5. The client will provide access, approvals, and accurate details.</div>
              <div>6. Disputes should first be resolved amicably under Nigerian law.</div>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#0b3d9a]">Engr. K.I Hillary</p>
              <p className="text-[8px] text-[#4b5563]">Authorized Signatory</p>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=1&data=${encodeURIComponent(whatsappLink)}`}
                alt="WhatsApp QR code"
                className="h-[56px] w-[56px] rounded-[3px] border border-[#f4a300] bg-white p-1"
              />
              <div className="text-right text-[7px] leading-[1.5] text-[#4b5563]">
                <p>Scan to chat on WhatsApp</p>
                <p className="mt-0.5 font-bold text-[#0b3d9a]">
                  FROM VISION TO LEGACY | +2349067883721
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
