let date = new Date();
let monthsList = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
let startYear = 2018;
let currentRow = 0;
let currentYear = date.getFullYear();
let currentMonth = date.getMonth();
let dates = $(".dates");
let tiptool = $(".tiptool");
let indexOfChosen;
let prevClick;
let todayYear = date.getFullYear();
let todayMonth = date.getMonth();
let todayDay = date.getDate();
let prevColored = $(`.date[data-year=${todayYear}][data-month=${todayMonth}]`);
let form = document.forms.booking;

function createCalendar() {
  let number = 1;
  let month = 0;
  let year = startYear;
  let whiteStart = new Date(startYear, 0, 1).getDay() - 1;
  if (whiteStart === -1) whiteStart = 6;
  let row = 0;

  for (let i = 0; i < 365 *8; i++) {
    if (i < whiteStart) {
      dates.append(`<div class="date"></div>`);
      continue;
    }

    let info = fillDataConsecutive(number, month, year, row, i);

    dates.append(`<div data-row=${row} data-year=${year} data-month=${month} data-number=${number} class="date">
                    <div data-number=${number} class="number"></div>
                    <div class="price"></div>
                </div>`);

    number = info.number;
    month = info.month;
    year = info.year;
    row = info.row;
  }
}

function fillDataConsecutive(number, month, year, row, i) {
  let finalNumber = 31;
  let isNewWeek = (i + 1) % 7 === 0;
  if (isNewWeek) row++;

  if (month === 1) {
    finalNumber = 28;
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) finalNumber = 29;
  } else if (month === 3 || month === 5 || month === 8 || month === 10) finalNumber = 30;
  else finalNumber = 31;

  number++;
  if (number > finalNumber) {
    number = 1;
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  return { number, month, year, row };
}

function fillCalendar() {
  $(".number").each(function () {
    $(this).text($(this).attr("data-number"));
  });

  $(".price").each(function () {
    let orderDay = new Date($(this).parent().attr("data-year"), $(this).parent().attr("data-month"), $(this).parent().attr("data-number"));
    if (orderDay < Date.now() - 10000000) return true;
    let price = 10;
    if (orderDay.getDay() === 6 || orderDay.getDay() === 0) price = 30;
    $(this).text(price + " р.");
  });

  fillCalendarDatabase();
}

function fillCalendarDatabase() {
  if (!localStorage.database) localStorage.setItem("database", JSON.stringify(database));
  let loadedDB = JSON.parse(localStorage.database);

  loadedDB.forEach((el) => {
    let orderedDay = $(`.date[data-year=${el.year}][data-month=${el.month}][data-number=${el.number}]>.price`);
    orderedDay.text(el.name);
    orderedDay.css({ color: "rgb(173, 62, 62)", fontSize: 11 });
    orderedDay.parent().attr("data-booked", true);
  });
}

function slideMonth(back = false, start = false) {
  if (start) {
    $(".month").text(monthsList[currentMonth]);
    $(".year").text(date.getFullYear());
  } else {
    if (back) {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
    } else {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }
  }
  $(".month").text(monthsList[currentMonth]);
  $(".year").text(currentYear);
  currentRow = $(`.date[data-year=${currentYear}][data-month=${currentMonth}]:has(.number[data-number=1])`).attr("data-row");
  dates.css("top", -61 * currentRow + "px");
}

function colorDates() {
  prevColored.css({ color: "", fontWeight: "" });
  prevColored.children().css("opacity", "0.3");
  prevColored = $(`.date[data-year=${currentYear}][data-month=${currentMonth}]`);
  prevColored.css({ color: "black", fontWeight: 600 });
  prevColored.children().css("opacity", "1");
  $(`.date[data-year=${todayYear}][data-month=${todayMonth}]>.number[data-number=${todayDay}]`).css("color", "red");
}

function sendEmail(adress, username, date, time, duration, price) {
  Email.send({
    Host: "smtp.elasticemail.com",
    Username: "mahendehen@gmail.com",
    Password: "3120547FF2001D5E346289F0ED1E70F64C06",
    To: [`${adress}`],
    From: "foleitan@gmail.com",
    Subject: "Бронирование аппартаментов",
    Body: `<p>Уважаемый, ${username}, вы успешно забронировали аппартаменты.</p> <p>Заселение ${date} в ${time} на срок ${duration} дней.</p><p>Стоимость составила ${price}</p>`,
  }).then((message) => {
    console.log(message);
  });
}

function clearInfoInputs() {
  form.duration.value = 1;
  form.time.value = "10:00";
  form.username.value = "";
  form.email.value = "";
  $(".range-output").text(1);

  $(".info").css("display", "none");
  $(".accepted").css({ display: "block" });
}

function changeDateState(thisDate) {
  $(".accepted").css({ display: "none" });
  $(prevClick).css({ transform: "", outline: "", background: "white", borderRadius: "" });
  thisDate.css({ transform: "scale(1.3)", outline: "3px solid rgb(253, 214, 214)", background: "white", borderRadius: "20%" });
  prevClick = thisDate;
}

function showInfo(thisDate, price) {
  $(".info").css("display", "flex");
  $(".info-date").text(thisDate.attr("data-year") + ", " + monthsList[thisDate.attr("data-month")] + ", " + thisDate.attr("data-number"));
  $(".info-price").text(price);
  $(".total-price-output").text(price);
  $("input[type=radio]").css("display", "");
  $("label").css("display", "");
  $(".total-price-submit").attr("disabled", false);
  $(".total-price-output").css("color", "");

  let beforeOrdered = $(".date").eq(thisDate.index() - 1);
  JSON.parse(localStorage.database).forEach((el) => {
    if (el.year == beforeOrdered.attr("data-year") && el.month == beforeOrdered.attr("data-month") && el.number == beforeOrdered.attr("data-number")) {
      if (el.time === "12:00") {
        $("input[type=radio]").eq(0).css("display", "none");
        $("label").eq(0).css("display", "none");
      }
      if (el.time === "14:00") {
        $("input[type=radio]").eq(0).css("display", "none");
        $("input[type=radio]").eq(1).css("display", "none");
        $("label").eq(0).css("display", "none");
        $("label").eq(1).css("display", "none");
      }
    }
  });
}

function calculatePrice(thisInput) {
  let borderElement;
  let totalPrice = 0;
  for (let i = 0; i < thisInput.val(); i++) {
    if ($(".date").eq(indexOfChosen + i).attr('data-booked')) {
      borderElement = indexOfChosen + i;
      totalPrice = "Данная дата недоступна";
      $(".total-price-submit").attr("disabled", true);
      $(".total-price-output").css("color", "red");
    } else if (indexOfChosen + i > borderElement) {
      totalPrice = "Данная дата недоступна";
    } else {
      totalPrice += parseInt($(".date").eq(indexOfChosen + i).children(".price").text());
      $(".total-price-submit").attr("disabled", false);
      $(".total-price-output").css("color", "");
    }
  }
    totalPrice !== "Данная дата недоступна" ? totalPrice+=" р." : totalPrice;
  $(".total-price-output").text(totalPrice);
  $(".total-price-output").val(totalPrice);
}

function showTiptool(event, thisDate) {
  if (!thisDate.children(".price").text()) return true;
  thisDate.css("background", "rgb(253, 214, 214)");
  tiptool.css({ display: "flex", top: event.clientY - 80, left: event.clientX + 10 });
  $(".tiptool-date").text(thisDate.attr("data-year") + " " + monthsList[thisDate.attr("data-month")] + " " + thisDate.attr("data-number"));
  $(".tiptool-price").text(thisDate.children(".price").text());
}

createCalendar();

fillCalendar();

colorDates();

slideMonth(false, true);

$(".next").click(() => {
  slideMonth();
  colorDates();
});

$(".back").click(() => {
  slideMonth(true);
  colorDates();
});

$(".date").hover(
  function (evt) {
    showTiptool(evt, $(this));
  },
  function () {
    $(this).css("background", "white");
    tiptool.text();
    tiptool.css("display", "none");
  }
);

$(".date").click(function () {
  let price = $(this).children(".price").text();
  if (!price || $(this).attr("data-booked")) return true;
  indexOfChosen = $(this).index();

  changeDateState($(this));
  showInfo($(this), price);
});

$("#duration-input").on("input", function () {
  let yearUntil = $(".date").eq(indexOfChosen + parseInt($(this).val())).attr('data-year')
  let monthUntil = parseInt($(".date").eq(indexOfChosen + parseInt($(this).val())).attr('data-month'))+1
  let numberUntil = $(".date").eq(indexOfChosen + parseInt($(this).val())).attr('data-number')

  $(".range-output").text($(this).val());
  $(".range-output-tip").text(`(до ${numberUntil}.${monthUntil}.${yearUntil})`);
  calculatePrice($(this));
});

$("form").submit(function (e) {
  e.preventDefault();
  sendEmail(form.email.value, form.username.value, $(".info-date").text(), form.time.value, form.duration.value, form.price.value);

  let bookedDay = $(".date").eq(indexOfChosen);
  let number = parseInt(bookedDay.attr("data-number"));
  let month = parseInt(bookedDay.attr("data-month"));
  let year = parseInt(bookedDay.attr("data-year"));
  let store = JSON.parse(localStorage.database);
  for (let i = 0; i < form.duration.value; i++) {
    let info = fillDataConsecutive(number, month, year, 0, i);

    store.push({
      year,
      month,
      number,
      name: form.username.value,
      time: form.time.value,
    });

    number = info.number;
    month = info.month;
    year = info.year;
  }

  store = JSON.stringify(store);
  localStorage.setItem("database", store);
  fillCalendarDatabase();
  clearInfoInputs();
});
