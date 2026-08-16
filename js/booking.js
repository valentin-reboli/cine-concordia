// Booking flow: seats -> tickets -> payment -> confirmation
const booking = {
  movie: null,
  dateLabel: "HOY 14 AGO",
  time: "",
  step: "seats",
  selectedSeats: [],
  seatTypes: {},
  occupiedSeats: [],
  paymentMethod: "tarjeta",
};

const STEP_ORDER = ["seats", "tickets", "payment"];
const STEP_LABELS = {
  seats: "Butacas",
  tickets: "Entradas",
  payment: "Pago",
  confirmation: "Confirmación",
};

function seededRandomOccupied(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967295;
  };
  const all = [];
  ["A", "B", "C", "D", "E", "F", "G"].forEach((r) => {
    for (let i = 1; i <= 10; i++) all.push(r + i);
  });
  const occ = [];
  while (occ.length < 14) {
    const seat = all[Math.floor(rand() * all.length)];
    if (!occ.includes(seat)) occ.push(seat);
  }
  return occ;
}

function openBooking(movie, timeObj) {
  booking.movie = movie;
  booking.time = timeObj.time + " · " + LANG_LABELS[timeObj.lang];
  booking.step = "seats";
  booking.selectedSeats = [];
  booking.seatTypes = {};
  booking.paymentMethod = "tarjeta";
  booking.occupiedSeats = seededRandomOccupied(
    movie.id + booking.dateLabel + booking.time,
  );

  document.getElementById("view-home").hidden = true;
  document.getElementById("view-booking").hidden = false;
  window.scrollTo(0, 0);
  renderBookingStep();
}

function closeBooking() {
  document.getElementById("view-booking").hidden = true;
  document.getElementById("view-home").hidden = false;
  window.scrollTo(0, 0);
}

function goToStep(step) {
  booking.step = step;
  renderBookingStep();
}

function backOneStep() {
  const idx = STEP_ORDER.indexOf(booking.step);
  if (idx <= 0) {
    closeBooking();
    return;
  }
  goToStep(STEP_ORDER[idx - 1]);
}

function toggleSeat(id) {
  if (booking.occupiedSeats.includes(id)) return;
  const i = booking.selectedSeats.indexOf(id);
  if (i > -1) {
    booking.selectedSeats.splice(i, 1);
    delete booking.seatTypes[id];
  } else {
    if (booking.selectedSeats.length >= 8) return;
    booking.selectedSeats.push(id);
    booking.seatTypes[id] = "general";
  }
  renderSeatStep();
}

function setSeatType(id, type) {
  booking.seatTypes[id] = type;
  renderTicketStep();
}

function setPaymentMethod(method) {
  booking.paymentMethod = method;
  renderPaymentStep();
}

function calcTotal() {
  return booking.selectedSeats.reduce(
    (sum, id) =>
      sum +
      (booking.seatTypes[id] === "reducida" ? PRICE_REDUCIDA : PRICE_GENERAL),
    0,
  );
}

function renderProgressSteps() {
  const el = document.getElementById("progress-steps");
  const steps = ["funcion", ...STEP_ORDER, "confirmation"];
  const currentIdx =
    STEP_ORDER.indexOf(booking.step) >= 0
      ? STEP_ORDER.indexOf(booking.step)
      : booking.step === "confirmation"
        ? STEP_ORDER.length
        : -1;

  el.innerHTML = steps
    .map((key, i) => {
      if (key === "funcion") {
        return stepPill("Función", "✓", true, false, i < steps.length - 1);
      }
      const stepIdx = STEP_ORDER.indexOf(key);
      const isDone = stepIdx > -1 && stepIdx < currentIdx;
      const isCurrent = key === booking.step;
      const icon =
        isDone || (key === "confirmation" && booking.step === "confirmation")
          ? "✓"
          : String(stepIdx + 1);
      return stepPill(
        STEP_LABELS[key],
        icon,
        isDone || (key === "confirmation" && booking.step === "confirmation"),
        isCurrent,
        i < steps.length - 1,
      );
    })
    .join("");
}

function stepPill(label, icon, done, current, hasLine) {
  let bg = "transparent",
    fg = "var(--text-muted)",
    border = "var(--border-strong)",
    labelColor = "var(--text-muted)";
  if (current) {
    bg = "var(--accent)";
    fg = "var(--bg)";
    border = "var(--accent)";
    labelColor = "var(--text-primary)";
  } else if (done) {
    bg = "var(--accent-soft-12)";
    fg = "var(--accent)";
    border = "var(--accent)";
    labelColor = "var(--text-primary)";
  }
  return `
    <div class="progress-step">
      <div class="progress-step-inner">
        <div class="progress-dot" style="background:${bg};color:${fg};border-color:${border}">${icon}</div>
        <span class="progress-label" style="color:${labelColor}">${label}</span>
      </div>
      ${hasLine ? '<div class="progress-line"></div>' : ""}
    </div>
  `;
}

function renderSeatStep() {
  document.getElementById("seats-context").textContent =
    `${booking.movie.title} · ${booking.movie.sala}`;

  const rowsEl = document.getElementById("seat-rows");
  const rows = ["A", "B", "C", "D", "E", "F", "G"];
  rowsEl.innerHTML = rows
    .map((r) => {
      const seats = Array.from({ length: 10 }, (_, i) => {
        const id = r + (i + 1);
        const occupied = booking.occupiedSeats.includes(id);
        const selected = booking.selectedSeats.includes(id);
        const cls = occupied ? "occupied" : selected ? "selected" : "";
        return `<button class="seat-btn ${cls}" data-seat-id="${id}" ${occupied ? "disabled" : ""}>${i + 1}</button>`;
      }).join("");
      return `<div class="seat-row"><span class="seat-row-label">${r}</span><div class="seat-row-seats">${seats}</div></div>`;
    })
    .join("");

  rowsEl.querySelectorAll(".seat-btn:not(:disabled)").forEach((btn) => {
    btn.addEventListener("click", () => toggleSeat(btn.dataset.seatId));
  });

  document.getElementById("seat-count-label").textContent =
    `${booking.selectedSeats.length} butaca(s) seleccionada(s)`;
  document.getElementById("seat-list-label").textContent =
    booking.selectedSeats.slice().sort().join(", ") || "—";

  updateContinueButton();
  renderSidebar();
}

function renderTicketStep() {
  const el = document.getElementById("ticket-rows");
  el.innerHTML = booking.selectedSeats
    .slice()
    .sort()
    .map((id) => {
      const type = booking.seatTypes[id] || "general";
      return `
      <div class="ticket-row">
        <div class="ticket-seat-id"><span class="ticket-seat-badge">${id}</span><span>Butaca</span></div>
        <div class="ticket-options">
          <button class="ticket-type-btn ${type === "general" ? "active" : ""}" data-seat="${id}" data-type="general">General · ${formatPrice(PRICE_GENERAL)}</button>
          <button class="ticket-type-btn ${type === "reducida" ? "active" : ""}" data-seat="${id}" data-type="reducida">Jubilados/Menores · ${formatPrice(PRICE_REDUCIDA)}</button>
        </div>
      </div>
    `;
    })
    .join("");

  el.querySelectorAll(".ticket-type-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      setSeatType(btn.dataset.seat, btn.dataset.type),
    );
  });

  renderSidebar();
}

function renderPaymentStep() {
  const el = document.getElementById("payment-methods");
  const methods = [
    { key: "tarjeta", label: "Tarjeta de crédito / débito" },
    { key: "mercadopago", label: "Mercado Pago" },
  ];
  el.innerHTML = methods
    .map(
      (m) => `
    <button class="payment-method-btn ${booking.paymentMethod === m.key ? "active" : ""}" data-method="${m.key}">
      <span>${m.label}</span>
      ${booking.paymentMethod === m.key ? '<span class="payment-check">✓</span>' : ""}
    </button>
  `,
    )
    .join("");

  el.querySelectorAll(".payment-method-btn").forEach((btn) => {
    btn.addEventListener("click", () => setPaymentMethod(btn.dataset.method));
  });

  document.getElementById("card-form").hidden =
    booking.paymentMethod !== "tarjeta";
  document.getElementById("mp-note").hidden =
    booking.paymentMethod !== "mercadopago";

  renderSidebar();
}

function renderSidebar() {
  const posterSlot = document.getElementById("summary-poster-slot");
  posterSlot.setAttribute("data-placeholder", booking.movie.title);
  if (booking.movie.poster) {
    posterSlot.classList.remove("cc-shimmer");
    posterSlot.style.backgroundImage = `url('${booking.movie.poster}')`;
    posterSlot.style.backgroundSize = "cover";
    posterSlot.style.backgroundPosition = "center";
  } else {
    posterSlot.classList.add("cc-shimmer");
    posterSlot.style.backgroundImage = "";
  }
  document.getElementById("summary-title").textContent = booking.movie.title;
  document.getElementById("summary-datetime").textContent =
    `${booking.dateLabel} · ${booking.time}`;
  document.getElementById("summary-sala").textContent = booking.movie.sala;
  document.getElementById("summary-seats").textContent =
    booking.selectedSeats.slice().sort().join(", ") || "—";
  document.getElementById("summary-count").textContent =
    booking.selectedSeats.length;

  const generalCount = booking.selectedSeats.filter(
    (id) => (booking.seatTypes[id] || "general") === "general",
  ).length;
  const reducidaCount = booking.selectedSeats.filter(
    (id) => booking.seatTypes[id] === "reducida",
  ).length;
  const breakdown = [];
  if (generalCount > 0)
    breakdown.push({
      label: `${generalCount}× General`,
      amount: formatPrice(generalCount * PRICE_GENERAL),
    });
  if (reducidaCount > 0)
    breakdown.push({
      label: `${reducidaCount}× Jubilados/Menores`,
      amount: formatPrice(reducidaCount * PRICE_REDUCIDA),
    });

  const breakdownEl = document.getElementById("sidebar-breakdown");
  const showBreakdown = booking.step !== "seats" && breakdown.length > 0;
  breakdownEl.hidden = !showBreakdown;
  if (showBreakdown) {
    breakdownEl.innerHTML = breakdown
      .map(
        (b) =>
          `<div class="sidebar-row"><span>${b.label}</span><span style="color:var(--text-primary)">${b.amount}</span></div>`,
      )
      .join("");
  }

  document.getElementById("summary-total").textContent =
    formatPrice(calcTotal());
}

function updateContinueButton() {
  const btn = document.getElementById("btn-continue");
  const disabled =
    booking.step === "seats" && booking.selectedSeats.length === 0;
  btn.disabled = disabled;
  btn.textContent =
    booking.step === "payment" ? "Confirmar compra" : "Continuar";
}

function renderBookingStep() {
  document.getElementById("step-seats").hidden = booking.step !== "seats";
  document.getElementById("step-tickets").hidden = booking.step !== "tickets";
  document.getElementById("step-payment").hidden = booking.step !== "payment";
  document.getElementById("step-confirmation").hidden =
    booking.step !== "confirmation";
  document.getElementById("continue-wrap").hidden =
    booking.step === "confirmation";
  document.getElementById("booking-sidebar").hidden =
    booking.step === "confirmation";

  renderProgressSteps();

  if (booking.step === "seats") renderSeatStep();
  else if (booking.step === "tickets") renderTicketStep();
  else if (booking.step === "payment") renderPaymentStep();
  else if (booking.step === "confirmation") {
    /* rendered by confirmPurchase */
  }

  updateContinueButton();
}

function confirmPurchase() {
  const orderNumber = "CC-" + Math.floor(100000 + Math.random() * 899999);
  document.getElementById("order-number").textContent = orderNumber;
  booking.step = "confirmation";
  renderBookingStep();
}

function handleContinue() {
  if (booking.step === "seats") goToStep("tickets");
  else if (booking.step === "tickets") goToStep("payment");
  else if (booking.step === "payment") confirmPurchase();
}

function initBookingControls() {
  document.getElementById("btn-back").addEventListener("click", () => {
    if (booking.step === "confirmation") closeBooking();
    else backOneStep();
  });
  document
    .getElementById("btn-continue")
    .addEventListener("click", handleContinue);
  document.getElementById("btn-reset").addEventListener("click", closeBooking);
  document
    .getElementById("edit-seats-link")
    .addEventListener("click", () => goToStep("seats"));
  document.getElementById("hero-buy-btn").addEventListener("click", () => {
    const spiderman = MOVIES.find((m) => m.id === "spiderman");
    openBooking(spiderman, spiderman.todayTimes[0]);
  });
}
