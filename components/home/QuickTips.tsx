export function QuickTips() {
  return (
    <section className="quick-tips">
      <div className="tips-header">
        <span className="badge" style={{ background: '#00a8a8' }}>Quick Fixes</span>
        <h2>60-Second <br />Life Hacks</h2>
        <p>Short, actionable tips you can try right now to save time and energy.</p>
      </div>

      <div className="tips-grid">
        <div className="tip-item">
          <h4>💡 Smelly Sneakers?</h4>
          <p>Place dry tea bags inside your shoes overnight to absorb moisture and unpleasant odors.</p>
        </div>
        <div className="tip-item">
          <h4>🍋 Microwave Steam Clean</h4>
          <p>Microwave a bowl of water with lemon slices for 3 minutes. The steam loosens all the gunk!</p>
        </div>
        <div className="tip-item">
          <h4>🍌 Ripen Bananas Fast</h4>
          <p>Need ripe bananas? Put them in the oven at 150°C for 15–30 mins until the skins turn black.</p>
        </div>
        <div className="tip-item">
          <h4>🔋 Battery Check</h4>
          <p>Drop a battery on a table. If it bounces once and falls, it&apos;s full. If it bounces multiple times, it&apos;s empty.</p>
        </div>
      </div>
    </section>
  );
}
