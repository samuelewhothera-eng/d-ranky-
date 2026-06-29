const { v4: uuidV4 } = require("uuid");

function generateTrackingId() {
  const raw = uuidV4().replace(/-/g, "").toUpperCase().slice(0, 10);
  return `DRK-${raw}`;
}

module.exports = { generateTrackingId };
