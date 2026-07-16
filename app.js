(function () {
  const fleet = document.getElementById("fleet-size");
  const events = document.getElementById("events");
  const labor = document.getElementById("labor");
  const downtime = document.getElementById("downtime");
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  function setAll(selector, value) {
    document.querySelectorAll(selector).forEach((element) => { element.textContent = value; });
  }

  function estimate() {
    const fleetSize = Number(fleet.value);
    const eventRate = Number(events.value);
    const laborRate = Number(labor.value);
    const downtimeHours = Number(downtime.value);
    const annualEvents = fleetSize * eventRate;
    const hoursSaved = Math.round(annualEvents * Math.max(downtimeHours - 0.5, 0));
    const laborSavings = hoursSaved * laborRate;
    const transportSavings = annualEvents * 70;
    const annualSavings = laborSavings + transportSavings;
    const eventValue = Math.round(annualSavings / Math.max(annualEvents, 1));
    const availability = Math.min(99, Math.round(92 + downtimeHours * 0.65));

    document.getElementById("fleet-output").textContent = `${fleetSize} vehicles`;
    document.getElementById("events-output").textContent = `${eventRate} / vehicle / year`;
    document.getElementById("labor-output").textContent = `${money.format(laborRate)} / hour`;
    document.getElementById("downtime-output").textContent = `${downtimeHours} hours / event`;
    setAll("[data-total]", money.format(annualSavings));
    setAll("[data-fleet-copy]", fleetSize);
    setAll("[data-hours]", hoursSaved);
    setAll("[data-availability]", availability);
    setAll("[data-event-value]", money.format(eventValue));
    setAll("[data-events]", annualEvents);
    setAll("[data-weekly]", Math.round(hoursSaved / 52));
    setAll("[data-labor-value]", money.format(laborSavings));
    setAll("[data-transport-value]", money.format(transportSavings));
    document.querySelector("[data-progress]").style.width = `${availability}%`;
    return { fleetSize, annualEvents, hoursSaved, annualSavings };
  }

  [fleet, events, labor, downtime].forEach((input) => input.addEventListener("input", estimate));
  document.getElementById("download-estimate").addEventListener("click", () => {
    const result = estimate();
    const text = `Onsite Tire Co. fleet estimate: ${result.fleetSize} vehicles, ${result.annualEvents} annual tire events, ${result.hoursSaved} downtime hours avoided, ${money.format(result.annualSavings)} potential annual operational savings.\n\nPlanning estimate only. Actual results vary.\n\nOnsite Tire Co. | 615-600-2092 | onsitetireco.com`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "onsite-tire-fleet-estimate.txt";
    link.click();
    URL.revokeObjectURL(url);
  });
  estimate();
})();
