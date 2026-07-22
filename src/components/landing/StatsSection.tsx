export default function StatsSection() {
  return (
    <div className="th-container">
      <div className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <i className="fas fa-users" />
            <h3>15.000+</h3>
            <p>Pelanggan Aktif</p>
          </div>
          <div className="stat-item">
            <i className="fas fa-map-marked-alt" />
            <h3>48</h3>
            <p>Coverage Area</p>
          </div>
          <div className="stat-item">
            <i className="fas fa-server" />
            <h3>
              99.9<small>%</small>
            </h3>
            <p>Uptime Server</p>
          </div>
          <div className="stat-item">
            <i className="fas fa-headset" />
            <h3>24/7</h3>
            <p>Customer Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}
