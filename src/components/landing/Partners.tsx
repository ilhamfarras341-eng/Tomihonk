const PARTNERS = [
  { i: "fa-google", n: "Google Cloud" },
  { i: "fa-microsoft", n: "Microsoft" },
  { i: "fa-aws", n: "AWS Partner" },
  { i: "fa-cloudflare", n: "Cloudflare" },
  { i: "fa-cisco", n: "Cisco" },
  { i: "fa-bullhorn", n: "Mikrotik" },
];

export default function Partners() {
  return (
    <section className="partner-strip">
      <div className="th-container">
        <div className="ps-label">Dipercaya oleh perusahaan &amp; mitra teknologi</div>
        <div className="partner-row">
          {PARTNERS.map((p) => (
            <div className="partner-item" key={p.n}>
              <i className={`fab ${p.i}`} />
              <span>{p.n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
