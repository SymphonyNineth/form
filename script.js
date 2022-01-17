import codes from "./postcode-regex.js";
let currentTab = 0;
const tabs = document.querySelectorAll(".tab");

function defineStyle(selector, property, value) {
    const el = document.querySelector(selector);
    el.style[property] = value;
}

function updateShippingFields(source, target) {
    target ??= `#shipping${source[1].toUpperCase() + source.slice(2)}`;
    const targetEl = document.querySelector(target);
    const sourceEl = document.querySelector(source);
    targetEl.value = sourceEl.value;
    if (!sourceEl.classList.contains("invld")) {
        targetEl.classList.remove("invld", "invalid");
    }
}

function updateButtons(currentTab, last) {
    if (currentTab == 0) {
        defineStyle("#prevBtn", "display", "none");
    } else {
        defineStyle("#prevBtn", "display", "inline");
    }

    if (currentTab == last - 1) {
        document.getElementById("nextBtn").innerText = "Submit";
    } else if (currentTab == last) {
        defineStyle("#prevBtn", "display", "none");
        defineStyle("#nextBtn", "display", "none");
    } else {
        document.getElementById("nextBtn").innerText = "Next";
    }
}

function setUpdater(source, target, event = "input") {
    target ??= `#shipping${source[1].toUpperCase() + source.slice(2)}`;

    const sourceEl = document.querySelector(source);
    const targetEl = document.querySelector(target);
    sourceEl.addEventListener(event, e => {
        const checkBox = document.querySelector("#useFilledData");
        if (!checkBox.checked) return;
        targetEl.value = e.target.value;
        if (!sourceEl.classList.contains("invld")) {
            targetEl.classList.remove("invld", "invalid");
        }
    });
}
["#city", "#address", "#postCode", "#country"].forEach(selector =>
    setUpdater(selector)
);

function updateStepIndicator(currentTab, total) {
    const stepContainer = document.querySelector("div#step");
    const currentStep = document.querySelector("span#current");
    const totalSteps = document.querySelector("span#total");
    if (currentTab === total) return stepContainer.remove();
    currentStep.innerText = currentTab + 1;
    totalSteps.innerText = total;
}

function displayTab(current, total) {
    tabs[current].style.display = "block";

    updateButtons(current, total);
}

function handleNextPrev(n, tabs) {
    tabs[currentTab].style.display = "none";
    currentTab = currentTab + n;
    displayTab(currentTab, tabs.length - 1);
    updateStepIndicator(currentTab, tabs.length - 1);
}
function handleButtonClicks() {
    const prevBtn = document.querySelector("#prevBtn");
    const nextBtn = document.querySelector("#nextBtn");
    prevBtn.addEventListener("click", () => handleNextPrev(-1, tabs));
    nextBtn.addEventListener("click", () => {
        if (isComplete(currentTab)) {
            handleNextPrev(1, tabs);
        }
    });
}
function validateCard() {
    function creditCardType(cc) {
        let amex = new RegExp("^3[47][0-9]{13}$");
        let visa = new RegExp("^4[0-9]{12}(?:[0-9]{3})?$");

        let mastercard = new RegExp("^5[1-5][0-9]{14}$");
        let mastercard2 = new RegExp("^2[2-7][0-9]{14}$");

        let disco1 = new RegExp("^6011[0-9]{12}[0-9]*$");
        let disco2 = new RegExp("^62[24568][0-9]{13}[0-9]*$");
        let disco3 = new RegExp("^6[45][0-9]{14}[0-9]*$");

        let diners = new RegExp("^3[0689][0-9]{12}[0-9]*$");
        let jcb = new RegExp("^35[0-9]{14}[0-9]*$");

        if (visa.test(cc)) {
            return "visa";
        }
        if (amex.test(cc)) {
            return "amex";
        }
        if (mastercard.test(cc) || mastercard2.test(cc)) {
            return "mastercard";
        }
        if (disco1.test(cc) || disco2.test(cc) || disco3.test(cc)) {
            return "discover";
        }
        if (diners.test(cc)) {
            return "diners";
        }
        if (jcb.test(cc)) {
            return "jcb";
        }
        return undefined;
    }

    const field = document.querySelector("#creditCard");
    const logo = document.querySelector("#cardLogo");
    field.addEventListener("input", e => {
        const cardNumber = e.target.value.replace(/\s/g, "");
        const cardType = creditCardType(cardNumber);
        if (cardType) {
            logo.style.display = "block";
            logo.src = `cards/${cardType}.png`;
        } else {
            logo.style.display = "none";
            logo.src = "";
        }
    });
}

validateCard();

const checkBox = document.querySelector("#useFilledData");
function validateShipping(isDisabled) {
    const fields = document.querySelector("#shippingFields").children;
    for (let field of fields) {
        if (isDisabled) {
            updateField(true, field);
        }
    }
}
checkBox.addEventListener("input", e => {
    handleShippingChange(e.target.checked);
    // validateShipping(e.target.checked);
});

function handleShippingChange(isDisabled) {
    const fields = Array.from(
        document.querySelector("#shippingFields").children
    );
    if (isDisabled) {
        ["#city", "#address", "#postCode", "#country"].forEach(selector =>
            updateShippingFields(selector)
        );
    }
    fields.forEach(field => (field.disabled = isDisabled));
}
function handleCreditCardInput(selector) {
    const cardField = document.querySelector(selector);
    let prevValue = "";
    cardField.addEventListener("input", e => {
        const value = e.target.value;
        e.target.value = value.replace(/[^0-9\s]/g, "");
        if (
            value.length > prevValue.length &&
            value.length > 0 &&
            value.length % 4 === 0
        ) {
            e.target.value = value + "    ";
        }
        prevValue = value;
    });
}

function updateField(isValid, el) {
    if (isValid) {
        el.classList.remove("invalid", "invld");
        el.classList.add("valid");
    } else {
        el.classList.add("invalid", "invld");
        el.classList.remove("valid");
    }
}

function validateStandardFields() {
    function validateStandard(string) {
        if (string.length > 0) {
            return true;
        }
        return false;
    }
    const fields = document.querySelectorAll(".standard");
    fields.forEach(field =>
        field.addEventListener("change", e => {
            updateField(validateStandard(e.target.value), e.target);
            console.log(field.value.length);
        })
    );
}

function validateEmail(email) {
    return !!String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
}

function validatePasswordField() {
    const passwordField = document.querySelector("#password");
    const repeatPasswordField = document.querySelector("#repeatPassword");
    passwordField.addEventListener("input", onPasswordChange);
    repeatPasswordField.addEventListener("input", onPasswordChange);
    function onPasswordChange() {
        updateField(
            passwordField.value === repeatPasswordField.value &&
                passwordField.value,
            passwordField
        );
        updateField(
            passwordField.value === repeatPasswordField.value &&
                passwordField.value,
            repeatPasswordField
        );
    }
}

validatePasswordField();

function validateField(validate, selector, event = "change") {
    const field = document.querySelector(selector);
    field.addEventListener(event, e => {
        updateField(validate(e.target.value), e.target);
    });
}

function validateCountry(countrySelector, postCodeSelector) {
    const field = document.querySelector(countrySelector);
    const postCodeField = document.querySelector(postCodeSelector);
    field.addEventListener("change", e => {
        updateField(e.target.value, field);
    });

    field.addEventListener("change", () => {
        updateField(
            validatePostCode(postCodeField.value, countrySelector),
            postCodeField
        );
    });
}

validateCountry("#country", "#postCode");
validateCountry("#shippingCountry", "#shippingPostCode");
function validatePostCode(value, forCountry) {
    const selectedCountry = document.querySelector(forCountry).value;
    if (!selectedCountry) return false;
    const codeRegEx = codes.find(
        ({ Country }) => Country === selectedCountry
    )?.Regex;
    if (!codeRegEx) {
        if (value.length > 1) return true;
    } else {
        return value.match(codeRegEx);
    }
    return false;
}

validateField(
    value => validatePostCode(value, "#country"),
    "#postCode",
    "change"
);
validateField(
    value => validatePostCode(value, "#shippingCountry"),
    "#shippingPostCode",
    "change"
);

validateField(
    timestamp => Date.parse(timestamp) > Date.now(),
    "#expDate",
    "change"
);

validateField(
    value => value.length > 0 && value.length < 100,
    "#ownersName",
    "input"
);

function limitInputChars(selector, max_length) {
    const field = document.querySelector(selector);
    field.addEventListener("input", e => {
        e.target.value = e.target.value.substring(0, max_length);
    });
}

limitInputChars("#ownersName", 100);
limitInputChars("#cvc", 4);

validateField(validateEmail, "#email", "change");

validateEmail();

validateStandardFields();

handleCreditCardInput("#creditCard");

function isComplete(tabNumber) {
    function markIncomplete(field) {
        field.classList.add("invalid");
    }
    const tab = document.querySelectorAll(".tab")[tabNumber];
    const fields = [
        ...tab.querySelectorAll("input"),
        ...tab.querySelectorAll("select"),
    ];

    let allComplete = true;

    for (let field of fields) {
        if (field.classList.contains("invld")) {
            allComplete = false;
            markIncomplete(field);
        }
    }
    return allComplete;
}
handleShippingChange();
displayTab(currentTab, tabs.length - 1);
handleButtonClicks();
updateStepIndicator(currentTab, tabs.length - 1);
