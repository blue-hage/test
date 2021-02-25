window.onload = function() {
    const useNodeJS = true;
    const defaultLiffId = "";

    let myLiffId = "";

    if(useNodeJS) {
        fetch('/send-id').then(function(reqResponse){
            return reqResponse.json();
        }).then(function(jsonResponse){
            myLiffId = jsonResponse.id;
            initializeLiffOrDie(myLiffId);
        }).catch(function(error){
            document.getElementById("liffAppContent").classList.remove('hiddent');
            document.getElementById("nodeLiffIdErrorMessage").classList.remove('hiddent');
        });
    } else{
        myLiffId = defaultLiffId;
        initializeLiffOrDie(myLiffId);    
    }
};


function initializeLiffOrDie(myLiffId){
    if(!myLiffId){
        document.getElementById("liffAppContent").classList.add("hiddent");
        document.getElementById("liffIdErrorMessage").classList.add("hidden");
    } else{
        initializeLiff(myLiffId);
    }
}

function initializeLiff(myLiffId){
    liff.init({
        liffId: myLiffId
    }).then(() => {
        initializeApp();
    }).catch((err) => {
        document.getElementById("liffAppContent").classList.add("hidden");
        document.getElementById("liffInitErrorMessage").classList.remove("hidden");
    });
}

function initializeApp(){
    displayLiffData();
    displayIsInClientInfo();
    registerButtonHandlers();

    if(liff.isLoggedIn()){
        document.getElementById("liffLoginButton").disabled = true;
    } else{
        document.getElementById("liffLogoutButton").disabled = true;
    }
}

// Display data generated by involking LIFF methods
function displayLiffData(){
    document.getElementById("browserLanguage").textContent = liff.getLanguage();
    document.getElementById("sdkVersion").textContent = liff.getVersion();
    document.getElementById("lineVersion").textContent = liff.getLineVersion();
    document.getElementById("isInClient").textContent = liff.isInClient();
    document.getElementById("isLoggedIn").textContent = liff.isLoggedIn();
    document.getElementById("deviceOS").textContent = liff.getOS();
}

// Toggle the login/logout buttons based on the isInClient status, and display a message accordingly
function displayIsInClientInfo(){
    if(liff.isInClient()){
        document.getElementById("liffLoginButton").classList.toggle("hidden");
        document.getElementById("liffLogoutButton").classList.toggle("hidden");
        document.getElementById("isInClientMessage").textContent = "You are opening the app in the in-app browser of LINE.";
    } else{
        document.getElementById("isInClientMessage").textContent = "You are opening the app in an external browser.";
        document.getElementById("shareTargetPicker").classList.toggle("hidden");
    }
}

// Register event handlers for the buttons displayed in the app
function registerButtonHandlers(){
    // openWindow call
    document.getElementById("openWindowButton").addEventListener("click", function(){
        liff.openWindow({
            url: "https://line.me",
            external: true
        });
    });

    // closeWindow call
    document.getElementById("closeWindowButton").addEventListener("click", function(){
        if(!liff.isInClient()){
            sendAlertIfNotInClient();
        } else{
            liff.closeWindow();
        }
    })

    // sendMessages call
    document.getElementById("sendMessageButton").addEventListener("click", function(){
        if(!liff.isInClient()){
            sendAlertIfNotInClient();
        } else{
            liff.sendMessages([{
                "type": "text",
                "text": "You've successfully sent a message! Hooray!"
            }]).then(function(error){
                window.alert("Error sending message: " + error);
            });
        }
    });

    // scanCode call
    document.getElementById("scanQrCodeButton").addEventListener("click", function(){
        if(!liff.isInClient()){
            sendAlertIfNotInClient();
        } else{
            liff.scanCode().then(result =>{
                result = {value: "Hello LIFF app!"}
                const stringfieddResult = JSON.stringify(result);
                document.getElementById("scanQrField").textContent = stringfieddResult;
                toggleQrCodeReader();
            }).catch(err =>{
                document.getElementById("scanQrField").textContent = "scanCode failed!";
            });
        }
    });

    // getAccessToken call
    document.getElementById("getAccessToken").addEventListener("click", function(){
        if(!liff.isLoggedIn() && !liff.isInClient()){
            alert("To get an access token, you need to be logged in. Please tap the 'login' button below and try again");
        } else{
            const accessToken = liff.getAccessToken();
            document.getElementById("accessTokenField").textContent = accessToken;
            toggleAccessToken();
        }
    });

    // getProfile call
    document.getElementById("getProfileButton").addEventListener("click", function(){
        liff.getProfile().then(function(profile){
            document.getElementById("userIdProfileField").textContent = profile.userId;
            document.getElementById("displayNameField").textContent = profile.displayName;

            const profilePictureDiv = document.getElementById("profilePictureDiv");
            if(profilePictureDiv.firstElementChild){
                profilePictureDiv.removeChild(profilePictureDiv.firstElementChild)
            }

            const img = document.createElement("img");
            img.src = profile.pictureUrl;
            img.alt = "Profile Picture";
            profilePictureDiv.appendChild(img);

            document.getElementById("statusMessageField").textContent = profile.statusMessage;
            toggleProfileData();
        }).catch(function(error){
            window.alert("Error getting profile: " + error);
        });
    });

    // shareTargetPicker call
    document.getElementById("shareTargetPicker").addEventListener("click", function(){
        if(liff.isApiAvailable("shareTargetPicker")){
            liff.shareTargetPicker([{
                "type": "text",
                "text": "Hello, World!"
            }]).then(
                document.getElementById("shareTargetPickerMessage").textContent = "Share target picker was launched."
            ).catch(function(res){
                document.getElementById("shareTargetPickerMessage").textContent = "Failed to launch share target picker.";
            });
        }
    });

    // login call, only when external browser is used
    document.getElementById("liffLoginButton").addEventListener("click", function(){
        if(!liff.isLoggedIn()){
            liff.login();
        }
    });

    // logout call only when external browse
    document.getElementById("liffLogoutButton").addEventListener("click", function(){
        if(liff.isLoggedIn()){
            liff.logout();
            window.location.reload();
        }
    });
}

// Alert the user if LIFF is opended in an external browser and unavailable buttons are tapped
function sendAlertIfNotInClient(){
    alert("This button is unabailable as LIFF is currently being opended in an external browser.");
}

// Toggle access token data field
function toggleAccessToken(){
    toggleElement("accessTokenData");
}

// Toggle profile info field
function toggleProfileData(){
    toggleElement("profileInfo");
}

// Toggle scanCode result field
function toggleQrCodeReader(){
    toggleElement("scanQr");
}

// Toggle specified element
function toggleElement(elementId){
    const elem = document.getElementById(elementId);
    if(elem.offsetWidth > 0 && elem.offsetHeight > 0){
        elem.style.display = "none";
    } else{
        elem.style.display = "block";
    }
}