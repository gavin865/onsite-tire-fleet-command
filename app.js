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
    setAll("[data-q1]", money.format(annualSavings * 0.25));
    setAll("[data-midyear]", money.format(annualSavings * 0.5));

    const onsiteHours = 0.5;
    const eventHoursSaved = Math.max(downtimeHours - onsiteHours, 0);
    const annualOffsitePerTruck = downtimeHours * eventRate;
    const annualOnsitePerTruck = onsiteHours * eventRate;
    const annualHoursSavedPerTruck = eventHoursSaved * eventRate;
    const formatHours = (value) => `${Number.isInteger(value) ? value : value.toFixed(1)} ${value === 1 ? "hr" : "hrs"}`;
    setAll("[data-event-offsite]", formatHours(downtimeHours));
    setAll("[data-event-saved]", formatHours(eventHoursSaved));
    setAll("[data-year-offsite]", formatHours(annualOffsitePerTruck));
    setAll("[data-year-onsite]", formatHours(annualOnsitePerTruck));
    setAll("[data-year-saved]", formatHours(annualHoursSavedPerTruck));
    const downtimeScale = Math.max(annualOffsitePerTruck, downtimeHours, 1);
    document.querySelector("[data-event-offsite-bar]").style.height = `${Math.max(10, (downtimeHours / downtimeScale) * 100)}%`;
    document.querySelector("[data-event-onsite-bar]").style.height = `${Math.max(8, (onsiteHours / downtimeScale) * 100)}%`;
    document.querySelector("[data-year-offsite-bar]").style.height = `${Math.max(10, (annualOffsitePerTruck / downtimeScale) * 100)}%`;
    document.querySelector("[data-year-onsite-bar]").style.height = `${Math.max(8, (annualOnsitePerTruck / downtimeScale) * 100)}%`;

    const laborPercent = annualSavings ? Math.round((laborSavings / annualSavings) * 100) : 0;
    const transportPercent = 100 - laborPercent;
    setAll("[data-labor-percent]", `${laborPercent}%`);
    setAll("[data-transport-percent]", `${transportPercent}%`);
    document.getElementById("savings-donut").style.background = `conic-gradient(var(--red) 0 ${laborPercent}%, #f4a3a8 ${laborPercent}% 100%)`;

    const bars = document.getElementById("monthly-bars");
    bars.innerHTML = "";
    for (let month = 1; month <= 12; month += 1) {
      const cumulative = Math.round((annualSavings * month) / 12);
      const bar = document.createElement("i");
      bar.style.height = `${Math.max(8, (month / 12) * 100)}%`;
      bar.setAttribute("aria-label", `Month ${month}: ${money.format(cumulative)} cumulative savings`);
      bar.innerHTML = `<span>${money.format(cumulative)}</span>`;
      bars.appendChild(bar);
    }
    return { fleetSize, annualEvents, hoursSaved, laborSavings, transportSavings, annualSavings };
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
  const emailTab = document.getElementById("email-results-tab");
  const emailPanel = document.getElementById("email-results-panel");
  emailTab.addEventListener("click", () => {
    const willOpen = emailPanel.hidden;
    emailPanel.hidden = !willOpen;
    emailTab.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) document.getElementById("results-email").focus();
  });
  emailPanel.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = estimate();
    const recipient = document.getElementById("results-email").value.trim();
    if (!recipient) return;
    const subject = "My Onsite Tire Co. Fleet Savings Estimate";
    const body = `Onsite Tire Co. Fleet Savings Estimate\n\nFleet size: ${result.fleetSize} vehicles\nAnnual tire events: ${result.annualEvents}\nDowntime avoided: ${result.hoursSaved} hours\nRecovered labor value: ${money.format(result.laborSavings)}\nTransport impact: ${money.format(result.transportSavings)}\nPotential annual operational savings: ${money.format(result.annualSavings)}\n\nPlanning estimate only. Actual results vary by fleet, route, vehicle, service mix, and scheduling.\n\nOnsite Tire Co. | 615-600-2092 | onsitetireco.com`;
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  estimate();
})();
