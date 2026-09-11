import { createFileRoute } from "@tanstack/react-router";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  BarChart3, Bell, Building2, Check, ChevronRight, CircleDollarSign, Clock3,
  Download, FileCheck2, FileText, Instagram, LayoutDashboard, Menu, MoreHorizontal,
  Plus, Printer, ReceiptText, Search, Send, Settings, Share2, Trash2, Users, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "B.A.B.C Quotation Studio" },
    { name: "description", content: "Create construction quotations, invoices, and track payments in NGN and USD." },
    { property: "og:title", content: "B.A.B.C Quotation Studio" },
    { property: "og:description", content: "Professional quotation management for B.A.B.C." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: QuotationApp,
});

type Item = { id: number; description: string; unit: string; quantity: number; rate: number };
type View = "dashboard" | "quotes" | "invoices" | "payments" | "clients" | "settings";

const services = ["Architectural drawing & approvals", "Site clearing and setting out", "Reinforced concrete foundation", "Blockwork and structural frame", "Roofing and rainwater system", "Electrical and plumbing installation", "Finishes and handover"];
const sampleQuotes = [
  { number: "BABC-Q-0028", client: "Obinna Holdings", project: "4-Bedroom Duplex, Awka", amount: 42850000, status: "Accepted", date: "08 Sep 2026" },
  { number: "BABC-Q-0027", client: "Nwafor Residence", project: "Residential Renovation, Nnewi", amount: 14860000, status: "Sent", date: "05 Sep 2026" },
  { number: "BABC-Q-0026", client: "Cedar View Ltd", project: "Apartment Block, Onitsha", amount: 87200000, status: "Draft", date: "01 Sep 2026" },
  { number: "BABC-Q-0025", client: "Adaora Eze", project: "Land & Building Inspection", amount: 450000, status: "Paid", date: "28 Aug 2026" },
];

const money = (value: number, currency = "NGN") => new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2 }).format(value);

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><div className="grid size-10 shrink-0 place-items-center bg-primary font-brand text-sm font-bold text-primary-foreground shadow-sm">BW</div>{!compact && <div><p className="font-brand text-sm font-bold leading-none text-foreground">B.A.B.C</p><p className="mt-1 text-[9px] font-semibold uppercase text-muted-foreground">From Vision to Legacy</p></div>}</div>;
}

function StatusPill({ status }: { status: string }) {
  const styles = status === "Accepted" || status === "Paid" ? "bg-success/10 text-success" : status === "Sent" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold", styles)}>{status}</span>;
}

function QuotationApp() {
  const [view, setView] = useState<View>("dashboard");
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [client, setClient] = useState({ name: "Obinna Holdings", company: "Obinna Holdings Ltd", phone: "+234 803 555 0128", address: "Agu Awka GRA, Awka, Anambra State" });
  const [title, setTitle] = useState("Proposed 4-Bedroom Duplex Construction");
  const [discount, setDiscount] = useState(500000);
  const [depositPct, setDepositPct] = useState(40);
  const [exchangeRate, setExchangeRate] = useState(1600);
  const [items, setItems] = useState<Item[]>([
    { id: 1, description: services[0] ?? "Architectural drawing & approvals", unit: "lump sum", quantity: 1, rate: 2850000 },
    { id: 2, description: services[1] ?? "Site clearing and setting out", unit: "lump sum", quantity: 1, rate: 2200000 },
    { id: 3, description: services[2] ?? "Reinforced concrete foundation", unit: "lump sum", quantity: 1, rate: 12800000 },
    { id: 4, description: services[3] ?? "Blockwork and structural frame", unit: "lump sum", quantity: 1, rate: 9600000 },
  ]);
  const documentRef = useRef<HTMLDivElement>(null);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.rate, 0), [items]);
  const total = Math.max(0, subtotal - discount);
  const deposit = total * (depositPct / 100);
  const converted = currency === "NGN" ? total / exchangeRate : total * exchangeRate;

  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 2600); return () => window.clearTimeout(timer); }, [notice]);
  const updateItem = (id: number, key: keyof Item, value: string | number) => setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const addItem = () => setItems((current) => [...current, { id: Date.now(), description: services[4] ?? "New construction item", unit: "lump sum", quantity: 1, rate: 0 }]);
  const notify = (message: string) => setNotice(message);
  const exportJpeg = async () => { if (!documentRef.current) return; const data = await toJpeg(documentRef.current, { quality: .96, pixelRatio: 2, backgroundColor: "#ffffff" }); const link = document.createElement("a"); link.download = "BABC-Q-0029.jpg"; link.href = data; link.click(); notify("JPEG ready for WhatsApp"); };
  const exportPdf = async () => { if (!documentRef.current) return; const data = await toJpeg(documentRef.current, { quality: .98, pixelRatio: 2, backgroundColor: "#ffffff" }); const pdf = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" }); pdf.addImage(data, "JPEG", 0, 0, 148, 210); pdf.save("BABC-Q-0029.pdf"); notify("A5 PDF downloaded"); };
  const shareWhatsApp = () => { const text = encodeURIComponent(`Hello ${client.name}, your B.A.B.C quotation BABC-Q-0029 for ${title} is ready. Total: ${money(total, currency)}.`); window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}?text=${text}`, "_blank", "noopener,noreferrer"); };

  const nav = [
    ["dashboard", LayoutDashboard, "Overview"], ["quotes", FileText, "Quotations"], ["invoices", ReceiptText, "Invoices"],
    ["payments", CircleDollarSign, "Payments"], ["clients", Users, "Clients"], ["settings", Settings, "Settings"],
  ] as const;

  return <div className="min-h-screen bg-background text-foreground">
    {notice && <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-md bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl"><Check className="mr-2 inline size-4" />{notice}</div>}
    <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card px-4 py-5 transition-transform lg:translate-x-0", menuOpen ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between px-2"><BrandMark /><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></Button></div>
      <nav className="mt-10 space-y-1">{nav.map(([id, Icon, label]) => <button key={id} onClick={() => { setView(id); setMenuOpen(false); }} className={cn("flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors", view === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}><Icon className="size-4" />{label}</button>)}</nav>
      <div className="absolute bottom-5 left-4 right-4 border-t border-border pt-4"><p className="text-xs font-bold">Engr. K.I Hillary</p><p className="text-[11px] text-muted-foreground">Super Admin</p></div>
    </aside>
    <main className="min-w-0 overflow-x-hidden lg:pl-64">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></Button><div><p className="text-xs font-semibold uppercase text-muted-foreground">Quotation Studio</p><p className="font-brand text-sm font-bold">B.A.B.C</p></div></div>
        <div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button><Button variant="gold" onClick={() => setEditorOpen(true)}><Plus /> New quotation</Button></div>
      </header>

      {view === "dashboard" && <Dashboard onCreate={() => setEditorOpen(true)} onView={() => setView("quotes")} />}
      {view === "quotes" && <Quotations onCreate={() => setEditorOpen(true)} onPreview={() => setPreviewOpen(true)} />}
      {view === "invoices" && <EmptyView icon={ReceiptText} title="Invoices" text="Accepted quotations become trackable invoices here." action="Create from quotation" onAction={() => setView("quotes")} />}
      {view === "payments" && <EmptyView icon={CircleDollarSign} title="Payment tracking" text="Record deposits and balances in Naira or US Dollars." action="View invoices" onAction={() => setView("invoices")} />}
      {view === "clients" && <Clients />}
      {view === "settings" && <SettingsView exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} notify={notify} />}
    </main>

    {editorOpen && <div className="fixed inset-0 z-50 bg-foreground/35 backdrop-blur-sm"><div className="absolute inset-y-0 right-0 flex w-full max-w-4xl flex-col bg-background shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-8"><div><p className="text-xs font-bold uppercase text-primary">BABC-Q-0029</p><h2 className="font-brand text-xl font-bold">New quotation</h2></div><Button variant="ghost" size="icon" onClick={() => setEditorOpen(false)} aria-label="Close editor"><X /></Button></div>
      <div className="flex-1 overflow-y-auto p-5 sm:p-8"><div className="grid gap-8 xl:grid-cols-[1fr_270px]">
        <div className="space-y-8"><section><SectionTitle number="01" title="Client & project" /><div className="grid gap-4 sm:grid-cols-2"><Field label="Client name" value={client.name} onChange={(v) => setClient({...client,name:v})}/><Field label="Company name" value={client.company} onChange={(v) => setClient({...client,company:v})}/><Field label="Phone number" value={client.phone} onChange={(v) => setClient({...client,phone:v})}/><Field label="Project address" value={client.address} onChange={(v) => setClient({...client,address:v})}/><div className="sm:col-span-2"><Field label="Quotation title" value={title} onChange={setTitle}/></div></div></section>
        <section><div className="flex items-center justify-between"><SectionTitle number="02" title="Scope & pricing" /><Button variant="outline" size="sm" onClick={addItem}><Plus /> Add item</Button></div><div className="mt-4 space-y-3">{items.map((item, i) => <div key={item.id} className="grid gap-2 border-b border-border pb-4 sm:grid-cols-[28px_1fr_80px_120px_36px]"><span className="pt-2 text-xs font-bold text-muted-foreground">{String(i+1).padStart(2,"0")}</span><Input value={item.description} onChange={(e) => updateItem(item.id,"description",e.target.value)} aria-label={`Item ${i+1} description`} /><Input type="number" min="0.001" step="0.001" value={item.quantity} onChange={(e) => updateItem(item.id,"quantity",Number(e.target.value))} aria-label="Quantity" /><Input type="number" min="0" value={item.rate} onChange={(e) => updateItem(item.id,"rate",Number(e.target.value))} aria-label="Rate" /><Button variant="ghost" size="icon" onClick={() => setItems((list) => list.filter((x) => x.id !== item.id))} aria-label="Remove item"><Trash2 /></Button></div>)}</div></section>
        <section><SectionTitle number="03" title="Terms & notes" /><Textarea defaultValue="This quotation is valid for 14 days. Work commences upon receipt of the required deposit. Variations will be quoted separately." rows={4}/></section></div>
        <aside className="space-y-5"><div><Label>Document currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NGN">NGN — Nigerian Naira</SelectItem><SelectItem value="USD">USD — US Dollars</SelectItem></SelectContent></Select></div><Field label="Exchange rate (₦ / $)" value={String(exchangeRate)} type="number" onChange={(v) => setExchangeRate(Number(v))}/><Field label={`Discount (${currency})`} value={String(discount)} type="number" onChange={(v) => setDiscount(Number(v))}/><Field label="Deposit required (%)" value={String(depositPct)} type="number" onChange={(v) => setDepositPct(Number(v))}/><div className="border-t border-border pt-5"><SummaryRow label="Subtotal" value={money(subtotal,currency)}/><SummaryRow label="Discount" value={`− ${money(discount,currency)}`}/><div className="mt-4 bg-primary p-4 text-primary-foreground"><p className="text-xs font-semibold opacity-70">Grand total</p><p className="mt-1 text-xl font-bold">{money(total,currency)}</p><p className="mt-2 text-xs opacity-80">≈ {money(converted,currency === "NGN" ? "USD" : "NGN")}</p></div><SummaryRow label={`Deposit (${depositPct}%)`} value={money(deposit,currency)}/><SummaryRow label="Outstanding" value={money(total-deposit,currency)}/></div></aside>
      </div></div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-card px-5 py-4 sm:px-8"><Button variant="outline" onClick={() => notify("Draft saved securely")}><Clock3 /> Save draft</Button><Button onClick={() => setPreviewOpen(true)}><FileCheck2 /> Preview quotation</Button></div>
    </div></div>}

    {previewOpen && <div className="fixed inset-0 z-[60] overflow-y-auto bg-foreground/70 p-3 sm:p-8"><div className="mx-auto flex max-w-4xl flex-col items-center"><div className="no-print mb-4 flex w-full flex-wrap justify-between gap-2"><Button variant="secondary" onClick={() => setPreviewOpen(false)}><X /> Close</Button><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => window.print()}><Printer /> Print A5</Button><Button variant="secondary" onClick={exportPdf}><Download /> PDF</Button><Button variant="secondary" onClick={exportJpeg}><Download /> JPEG</Button><Button variant="gold" onClick={shareWhatsApp}><Share2 /> WhatsApp</Button></div></div><QuoteDocument ref={documentRef} client={client} title={title} items={items} currency={currency} subtotal={subtotal} discount={discount} total={total} deposit={deposit} converted={converted} /></div></div>}
  </div>;
}

function Dashboard({ onCreate, onView }: { onCreate: () => void; onView: () => void }) {
  const stats = [["Quoted this month","₦145.4M","+18.2%",FileText],["Accepted value","₦89.6M","61.6%",FileCheck2],["Payments received","₦21.8M","This month",CircleDollarSign],["Outstanding","₦35.9M","4 invoices",Clock3]] as const;
  return <div className="mx-auto max-w-7xl p-4 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase text-highlight">Friday, 11 September</p><h1 className="mt-2 font-brand text-3xl font-bold sm:text-4xl">Good afternoon, Hillary.</h1><p className="mt-2 text-sm text-muted-foreground">Your business at a glance.</p></div><Button onClick={onCreate}><Plus /> Create quotation</Button></div>
  <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label,value,meta,Icon]) => <div key={label} className="bg-card p-5"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="mt-5 text-2xl font-bold">{value}</p><p className="mt-1 text-xs font-semibold text-success">{meta}</p></div>)}</div>
  <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[1.55fr_1fr]"><section className="min-w-0 bg-card"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-brand font-bold">Recent quotations</h2><p className="mt-1 text-xs text-muted-foreground">Latest client activity</p></div><Button variant="ghost" size="sm" onClick={onView}>View all <ChevronRight /></Button></div><QuoteTable /></section><section className="min-w-0 bg-primary p-6 text-primary-foreground"><p className="text-xs font-bold uppercase text-highlight">September performance</p><h2 className="mt-3 font-brand text-2xl font-bold">61.6% acceptance rate</h2><div className="mt-8 flex h-36 items-end gap-3">{[32,55,43,78,62,91,70].map((v,i)=><div key={i} className="flex h-full flex-1 items-end bg-primary-foreground/10"><div className="w-full bg-highlight" style={{height:`${v}%`}} /></div>)}</div><div className="mt-4 flex justify-between text-[10px] opacity-70"><span>Week 1</span><span>Week 4</span></div><div className="mt-7 border-t border-primary-foreground/20 pt-5"><p className="text-xs opacity-70">Next expiring quotation</p><p className="mt-1 text-sm font-semibold">BABC-Q-0027 · in 4 days</p></div></section></div></div>;
}

function QuoteTable() { return <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead><tr className="text-[10px] uppercase text-muted-foreground">{["Number / Client","Project","Amount","Status","Date",""].map(x=><th key={x} className="px-5 py-3 font-bold">{x}</th>)}</tr></thead><tbody>{sampleQuotes.map(q=><tr key={q.number} className="border-t border-border text-sm"><td className="px-5 py-4"><p className="font-bold">{q.number}</p><p className="text-xs text-muted-foreground">{q.client}</p></td><td className="px-5 py-4 text-xs">{q.project}</td><td className="px-5 py-4 font-bold">{money(q.amount)}</td><td className="px-5 py-4"><StatusPill status={q.status}/></td><td className="px-5 py-4 text-xs text-muted-foreground">{q.date}</td><td className="px-5 py-4"><Button variant="ghost" size="icon" aria-label="More options"><MoreHorizontal /></Button></td></tr>)}</tbody></table></div> }

function Quotations({onCreate,onPreview}:{onCreate:()=>void;onPreview:()=>void}) { return <div className="mx-auto max-w-7xl p-4 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-highlight">Documents</p><h1 className="mt-2 font-brand text-3xl font-bold">Quotations</h1></div><Button onClick={onCreate}><Plus /> New quotation</Button></div><div className="mt-8 flex gap-3"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" placeholder="Search quotation, client or project" /></div></div><div className="mt-5 bg-card" onClick={onPreview}><QuoteTable /></div></div> }

function Clients() { return <div className="mx-auto max-w-7xl p-4 sm:p-8"><p className="text-xs font-bold uppercase text-highlight">Relationships</p><h1 className="mt-2 font-brand text-3xl font-bold">Clients</h1><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{sampleQuotes.slice(0,3).map((q,i)=><div className="border border-border bg-card p-5" key={q.client}><div className="flex items-start justify-between"><div className="grid size-11 place-items-center bg-primary font-brand font-bold text-primary-foreground">{q.client.charAt(0)}</div><StatusPill status={i===0?"Active":"Lead"}/></div><h2 className="mt-5 font-bold">{q.client}</h2><p className="mt-1 text-xs text-muted-foreground">{q.project}</p><div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="text-xs text-muted-foreground">Lifetime value</span><strong className="text-sm">{money(q.amount)}</strong></div></div>)}</div></div> }

function SettingsView({exchangeRate,setExchangeRate,notify}:{exchangeRate:number;setExchangeRate:(n:number)=>void;notify:(s:string)=>void}) { return <div className="mx-auto max-w-4xl p-4 sm:p-8"><p className="text-xs font-bold uppercase text-highlight">Administration</p><h1 className="mt-2 font-brand text-3xl font-bold">Company settings</h1><div className="mt-8 grid gap-8 bg-card p-5 sm:p-8"><section><SectionTitle number="01" title="Business profile"/><div className="grid gap-4 sm:grid-cols-2"><Field label="Company name" value="B.A.B.C BIG-WIG ARCHITECTURE AND BUILDING CONSTRUCTION COMPANY" onChange={()=>{}}/><Field label="Registration number" value="7051820" onChange={()=>{}}/><Field label="Official email" value="destinybigwig@gmail.com" onChange={()=>{}}/><Field label="Phone" value="+2349067883721" onChange={()=>{}}/></div></section><section><SectionTitle number="02" title="Documents & currency"/><div className="grid gap-4 sm:grid-cols-2"><Field label="Default NGN / USD rate" type="number" value={String(exchangeRate)} onChange={(v)=>setExchangeRate(Number(v))}/><Field label="Default validity (days)" type="number" value="14" onChange={()=>{}}/></div></section><section><SectionTitle number="03" title="Payment accounts"/><div className="grid gap-4 sm:grid-cols-2"><div className="border border-border p-4"><strong className="text-sm">Nigerian Naira · UBA</strong><p className="mt-2 text-sm">BIG WIG ARCHITECTURE AND BUILDING CONSTRUCTION</p><p className="mt-1 font-bold">1031019964</p></div><div className="border border-border p-4"><strong className="text-sm">US Dollars · UBA</strong><p className="mt-2 text-sm">Kwamu Hilary Ifechukwudere</p><p className="mt-1 font-bold">2380556018</p><p className="mt-1 text-xs text-muted-foreground">SWIFT UNAFNGLA · Sort 033250380</p></div></div></section><Button className="w-fit" onClick={()=>notify("Company settings saved")}>Save settings</Button></div></div> }

function EmptyView({icon:Icon,title,text,action,onAction}:{icon:typeof FileText;title:string;text:string;action:string;onAction:()=>void}) { return <div className="grid min-h-[calc(100vh-4rem)] place-items-center p-6"><div className="max-w-md text-center"><div className="mx-auto grid size-16 place-items-center bg-primary/10 text-primary"><Icon className="size-7"/></div><h1 className="mt-6 font-brand text-3xl font-bold">{title}</h1><p className="mt-3 text-sm text-muted-foreground">{text}</p><Button className="mt-6" onClick={onAction}>{action}<ChevronRight/></Button></div></div> }
function SectionTitle({number,title}:{number:string;title:string}) { return <div className="mb-4 flex items-center gap-3"><span className="text-xs font-bold text-highlight">{number}</span><h3 className="font-brand text-sm font-bold">{title}</h3><div className="h-px flex-1 bg-border"/></div> }
function Field({label,value,onChange,type="text"}:{label:string;value:string;onChange:(v:string)=>void;type?:string}) { return <div><Label>{label}</Label><Input className="mt-2" type={type} value={value} onChange={(e)=>onChange(e.target.value)} /></div> }
function SummaryRow({label,value}:{label:string;value:string}) { return <div className="flex justify-between border-b border-border py-3 text-xs"><span className="text-muted-foreground">{label}</span><strong>{value}</strong></div> }

const QuoteDocument = forwardRef<HTMLDivElement, {client:{name:string;company:string;phone:string;address:string};title:string;items:Item[];currency:string;subtotal:number;discount:number;total:number;deposit:number;converted:number}>(({client,title,items,currency,subtotal,discount,total,deposit,converted},ref) => <div ref={ref} className="print-document w-[148mm] min-h-[210mm] bg-document p-[11mm] text-foreground shadow-2xl">
  <header className="flex justify-between border-b-2 border-primary pb-5"><BrandMark/><div className="text-right"><p className="font-brand text-2xl font-bold text-primary">QUOTATION</p><p className="mt-1 text-xs font-bold">BABC-Q-0029</p><p className="mt-1 text-[9px] text-muted-foreground">11 Sep 2026 · Valid until 25 Sep 2026</p></div></header>
  <div className="mt-5 grid grid-cols-2 gap-6"><div><p className="text-[8px] font-bold uppercase text-highlight">Prepared for</p><p className="mt-2 text-sm font-bold">{client.name}</p><p className="text-[9px] text-muted-foreground">{client.company}<br/>{client.phone}<br/>{client.address}</p></div><div className="text-right"><p className="text-[8px] font-bold uppercase text-highlight">Project</p><p className="mt-2 text-xs font-bold">{title}</p></div></div>
  <table className="mt-6 w-full text-left"><thead className="bg-primary text-primary-foreground"><tr className="text-[8px] uppercase"><th className="p-2">Description</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Rate</th><th className="p-2 text-right">Amount</th></tr></thead><tbody>{items.map(i=><tr key={i.id} className="border-b border-border text-[9px]"><td className="p-2 font-semibold">{i.description}</td><td className="p-2 text-center">{i.quantity}</td><td className="p-2 text-right">{money(i.rate,currency)}</td><td className="p-2 text-right font-bold">{money(i.rate*i.quantity,currency)}</td></tr>)}</tbody></table>
  <div className="mt-5 ml-auto w-56"><SummaryRow label="Subtotal" value={money(subtotal,currency)}/><SummaryRow label="Discount" value={`− ${money(discount,currency)}`}/><div className="mt-2 bg-primary p-3 text-primary-foreground"><div className="flex items-end justify-between"><span className="text-[8px] font-bold uppercase">Grand total</span><strong className="text-base">{money(total,currency)}</strong></div><p className="mt-1 text-right text-[8px] opacity-80">{money(converted,currency === "NGN" ? "USD" : "NGN")}</p></div><SummaryRow label="Deposit required" value={money(deposit,currency)}/><SummaryRow label="Outstanding" value={money(total-deposit,currency)}/></div>
  <div className="mt-6 grid grid-cols-2 gap-5 border-t border-border pt-4 text-[8px]"><div><p className="font-bold uppercase text-primary">NGN Payment · UBA</p><p className="mt-1">BIG WIG ARCHITECTURE AND BUILDING CONSTRUCTION<br/><b>1031019964</b></p></div><div><p className="font-bold uppercase text-primary">USD Payment · UBA</p><p className="mt-1">Kwamu Hilary Ifechukwudere · <b>2380556018</b><br/>SWIFT UNAFNGLA · Sort 033250380</p></div></div>
  <div className="mt-6 flex items-end justify-between"><div className="max-w-[65%] text-[7px] leading-relaxed text-muted-foreground">No. 5 Benbella Street, Umuchima Uli, Anambra State<br/>+234 906 788 3721 · destinybigwig@gmail.com · RC 7051820<br/>babcofficialsite.vercel.app</div><div className="text-center"><div className="mb-1 h-px w-28 bg-foreground"/><p className="text-[8px] font-bold">Engr. K.I Hillary</p><p className="text-[7px] text-muted-foreground">Authorized Signatory</p></div></div>
</div>);