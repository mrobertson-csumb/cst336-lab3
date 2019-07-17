/* --- global vars --------------------------------------------------------- */
let zip = $('#zip');
let state = $('#state');
let username = $('#username');
let signup = $('#signup');

let usernameOK = false;

/* --- event listeners ---------------------------------------------------- */
window.onload = initStates();

// zip value change -> zip api call
// -> update dependent elements (zip, lat, lng)
zip.on('change',
    () => zipCall(zip.val())
);

// state value change -> state api call -> update dependent element (county dropdown)
state.on('change',
    () => stateCall(state.val().toLowerCase())
);

// username value change -> username api call
// -> success message (green) OR error message (red)
username.on('change',
    () => userCall(username.val())
);


// submit -> prevent-default & sign up
signup.on('submit',
    () => {
        event.preventDefault();
        signUp()
    }
);


/* --- functions ---------------------------------------------------------- */
/**
 * Calls the state abbreviation api for all states
 */
function initStates() {
    $.ajax({
        method: 'GET',
        url: 'https://cst336.herokuapp.com/projects/api/state_abbrAPI.php',
        dataType: 'JSON',
        success: (resp, stat) => {
            let state = $('#state');
            state.empty();
            state.append(`<option>- Select One -</option>`);
            resp.forEach(e =>
                state.append(`<option value="${e.usps}">${e.state}</option>`));
        }
    })
}

/**
 * Calls the city info api for a given zip code
 * @param zip the zip code to lookup
 */
function zipCall(zip) {
    let zipMsg = $('#zip_msg');
    zipMsg.hide();
    // U.S. zip codes only have numbers
    if (zip.match(/[^$,.\d]/)) {
        showError(zipMsg, `${zip} is not a valid U.S. zip code.`);
        return;
    }

    $.ajax({
        method: 'GET',
        url: 'https://cst336.herokuapp.com/projects/api/cityInfoAPI.php',
        dataType: 'JSON',
        data: {zip: zip},
        success: (resp, stat) => {
            if (resp !== false && stat !== 200) {
                $('#city').val(resp.city);
                $('#lat').val(parseFloat(resp.latitude).toFixed(6));
                $('#lng').val(parseFloat(resp.longitude).toFixed(6));
            } else {
                showError(zipMsg, `Zip Code: ${zip} was not found`)
            }
        }
    })
}

/**
 * Calls the county list api for a given state's two letter code
 * @param state the state to lookup
 */
function stateCall(state) {
    $.ajax({
        method: 'GET',
        url: 'https://cst336.herokuapp.com/projects/api/countyListAPI.php',
        dataType: 'JSON',
        data: {state: state},
        success: (resp, stat) => {
            let county = $('#county');
            county.empty();
            county.append(`<option>- Select One -</option>`);
            resp.forEach(e => county.append(`<option>${e.county}</option>`));
        }
    })
}

/**
 * Calls the usernames api for a given username
 * @param username the username to lookup
 */
function userCall(username) {
    let element = $('#un_msg');
    if (username.length === 0) {
        element.hide();
        return;
    }

    $.ajax({
        method: 'GET',
        url: 'https://cst336.herokuapp.com/projects/api/usernamesAPI.php',
        dataType: 'JSON',
        data: {username: username},
        success: (resp, stat) => {
            let element = $('#un_msg');
            usernameOK = false;
            if (resp.available) {
                element.html(`<span class="alert alert-success">Yay, <strong>${username}</strong> is available!</span>`);
                usernameOK = true;
            } else {
                element.html(`<span class="alert alert-danger">Sorry, <strong>${username}</strong> is not available.</span>`);
            }
            element.show()
        }
    })
}

/**
 * Shows an error message on a given target element
 * @param target the element to display the error on
 * @param message the message to display
 */
function showError(target, message) {
    target.html(`<span class="alert alert-danger"><strong>${message}</strong></span>`);
    target.show()
}

/**
 * Tries to create a new user with the currently submitted form
 */
function signUp() {
    // validate fields
    let isValid = validate(
        showError
    );
    if (isValid) {
        location.href = 'welcome.html';
    }
}

/**
 * Validates the currently submitted form,
 * executes the given callbacks if applicable
 * returns true if the validation passes
 * @param errorCallBack a callback for messaging to the user that
 *        a validation error occurred
 * @returns {boolean} true if validation passes
 */
function validate(errorCallBack) {
    let isValid = usernameOK;
    // username ok?
    if (username.val().length <= 0) {
        isValid = false;
        errorCallBack($('#un_msg'), 'Username is required');
    }

    // password ok?
    // note: order of these conditional statements is important
    let pwMsg = $('#pw_msg');
    let rptMsg = $('#rpt_msg');

    // clear messages
    pwMsg.hide();
    rptMsg.hide();

    let password = $('#password').val();
    let repeat = $('#repeat').val();

    if (password !== repeat) {
        isValid = false;
        errorCallBack(rptMsg, 'Passwords must match')
    }

    if (repeat.length <= 0) {
        isValid = false;
        errorCallBack(rptMsg, 'Repeat your password')
    }

    if (password.length < 6) {
        isValid = false;
        errorCallBack(pwMsg, 'Password must be at least six characters')
    }

    if (password.length <= 0) {
        isValid = false;
        errorCallBack(pwMsg, 'Password is required')
    }

    return isValid;
}
