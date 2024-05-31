var toastMixin = Swal.mixin({
    toast: true,
    icon: 'success',
    title: 'General Title',
    animation: false,
    position: 'top-right',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

const login_url = keycloak_url;

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const spinner = document.getElementById('spinner');

    // Function to parse query parameters
    function getQueryParams() {
        let params = {};
        let queryString = window.location.search.substring(1);
        let regex = /([^&=]+)=([^&]*)/g;
        let m;
        while (m = regex.exec(queryString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        return params;
    }

    // Function to perform login
    function performLogin(username, password) {
        spinner.style.display = 'block';

        const loginObj = {
            username: username,
            password: password
        };

        const reqData = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Set content type to JSON
            },
            body: JSON.stringify(loginObj) // Convert JSON data to a string and set it as the request body
        }

        // Make the fetch request with the provided options
        fetch(`${login_url}/keycloakLogin`, reqData)
            .then(response => {
                // Check if the request was successful
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Parse the response as JSON
                return response.json();
            })
            .then(res => {
                // Handle the JSON data
                console.log(res);
                // this.storeValues(data);
                let resources = res.keycloak_User.permittedResources.Resources;
                sessionStorage.setItem("username", res.keycloak_User.username);
                sessionStorage.setItem("tenant", res.keycloak_User.realm);
                sessionStorage.setItem("token", res.token);
                localStorage.setItem("resources", JSON.stringify(resources));
                spinner.style.display = 'none';

                toastMixin.fire({
                    animation: true,
                    title: 'Signed in Successfully'
                });

                const redirectPath = setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1000);
            })
            .catch(error => {
                // Handle any errors that occurred during the fetch
                console.error('Fetch error:', error);
                spinner.style.display = 'none';

                toastMixin.fire({
                    title: 'User Credentials are not valid!',
                    icon: 'error'
                });
            });
    }

    // Check for username and password in the query parameters
    let params = getQueryParams();
    if (params.username && params.password) {
        performLogin(params.username, params.password);
    }

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        performLogin(loginForm.username.value, loginForm.password.value);
    });
});
