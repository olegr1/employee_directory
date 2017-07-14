{    
    //Creating references to elements on the page
    let $body,
        $employeeList,
        $filter,
        $modal,   
        $modalBackdrop,
        $modalCloseBtn,     
        $modalPrevBtn,
        $modalNextBtn,
        $modalEmployeePicture,
        $modalEmployeeName,
        $modalEmployeeEmail,
        $modalEmployeeUsername,
        $modalEmployeeCity,
        $modalEmployeeCell,
        $modalEmployeeStreeet,
        $modalEmployeeState,
        $modalEmployeePostal,
        $modalEmployeeCountry,
        $modalEmployeeBday;

    let employeeInfoCollection = []; // Origianl list of 12 emplyees
    let filteredEmployeeInfoCollection = []; // Filtered list of emplyess, same as employeeInfoCollection if no filters are provided
    
    let currentEmployeeIndex = 0; //The employe showing up in the modal

    function init(){

        //The DOM is now ready so get the elements and wrap them in jQuery objects
        $body = $("body");
        $employeeList = $("#employee-list");
        $filter = $("#fiter");
        $modal = $("#emplyee-modal");
        $modalBackdrop = $(".modal-backdrop");
        $modalCloseBtn = $modal.find("#emplyee-modal-close");
        $modalPrevBtn = $modal.find("#emplyee-modal-prev");
        $modalNextBtn = $modal.find("#emplyee-modal-next");
        $modalEmployeePicture = $modal.find(".employee-picture");
        $modalEmployeeName = $modal.find(".employee-name");
        $modalEmployeeEmail = $modal.find(".employee-email");
        $modalEmployeeCity = $modal.find(".employee-city");
        $modalEmployeeUsername = $modal.find(".employee-username");
        $modalEmployeeCell = $modal.find(".employee-cell");
        $modalEmployeeStreeet = $modal.find(".employee-street");
        $modalEmployeeState = $modal.find(".employee-state");
        $modalEmployeePostal = $modal.find(".employee-postal");
        $modalEmployeeCountry = $modal.find(".employee-country");
        $modalEmployeeBday = $modal.find(".employee-birthday-date");

        //Request data from the API
        $.ajax({
        url: "https://randomuser.me/api/",
            dataType: "jsonp",
            data: {
                results: 12,
                nat: "US"
            },
            success: function( response ) {
                gatherRelevantInfo(response.results);
                renderEmeployeeList();
            },
            error: function(jqXHR){
                console.log(jqXHR.status + " " + jqXHR.statusText);
            }
        });

        //Handle employee list item click
        $employeeList.on("click", "li", handleEmployeeClick);

        //Add event listeners on modal controls
        $modalBackdrop.on("click", closeModal);
        $modalCloseBtn.on("click", closeModal);
        $modalNextBtn.on("click", getPrevNextEmployeeInModal);
        $modalPrevBtn.on("click", getPrevNextEmployeeInModal);

        //Handle typing in the filter field
        $filter.on("keyup", handleFilterKeypress);
    };


    function gatherRelevantInfo(employeArray) {

        //Loop over the array rceived from the API
        $.each(employeArray, function(){

            let employee = $(this)[0];

            //Construct an object for each employee containing only relevant and pre-formatted information
            let employeeInfo = {
                isVisible: true,
                picture: employee.picture.large,
                name: employee.name.first + ' ' + employee.name.last,
                email: employee.email,
                city: employee.location.city,
                cell: employee.cell,
                state: abbreviateUsState(employee.location.state),
                street:  employee.location.street,
                postal: employee.location.postcode,
                nationality: getCountryName(employee.nat),
                birthday:  employee.dob.split(" ")[0].replace("-", "/").replace("-", "/"),
                username: employee.login.username
            }        

            //Push the newly created employee info to the dedicated array
            employeeInfoCollection.push(employeeInfo);
        });

        //This is the first run so no filters exist
        filteredEmployeeInfoCollection = employeeInfoCollection;
    }    

    //Render the visual representation of the employee list according to the mockups
    function renderEmeployeeList(){

        //Start with a clean list element
        $employeeList.empty();

        //Go over the filtered user list and create the list item markup
        $.each(filteredEmployeeInfoCollection, function(index, employee){    
            let $listItem = $('<li>' + 
                '<div class="employee-wrap">' +
                    '<img class="employee-picture" src="'+ employee.picture + '" alt="employee photo">' + 
                    '<div class="employee-info-wrap">' +
                        '<div class="employee-name">'+ employee.name + '</div>' + 
                        '<div class="employee-email">'+ employee.email + '</div>' + 
                        '<div class="employee-username">'+ employee.username + '</div>' + 
                        '<div class="employee-city">'+ employee.city + ", " + employee.nationality + '</div>' + 
                    '</div>' +
                '</div>' +
            '</li>');

            //Save employee index in the array in the list item's data property to associate the two
            $listItem.data("index", index);
            //Add the list item to the DOM
            $employeeList.append($listItem);
        });
    }

    function handleEmployeeClick(){        

        //Get the employee index the clicked item represents
        let employeeIndex =  $(this).data("index"); 
        //Pull the corresponding employee object from the array
        let employeeInfo = filteredEmployeeInfoCollection[employeeIndex];

        //Push the employee info to the modal and open it
        updateModal(employeeInfo);  
        openModal();
    }


    function updateModal(employeeInfo){        

        //Fill the appropriate elements of the modal with employee info
        $modalEmployeePicture.attr("src", employeeInfo.picture);
        $modalEmployeeName.text(employeeInfo.name);
        $modalEmployeeEmail.text(employeeInfo.email);
        $modalEmployeeUsername.text(employeeInfo.username);
        $modalEmployeeCity.text(employeeInfo.city);
        $modalEmployeeCell.text(employeeInfo.cell);
        $modalEmployeeStreeet.text(employeeInfo.street);
        $modalEmployeeState.text(employeeInfo.state);
        $modalEmployeePostal.text(employeeInfo.postal);
        $modalEmployeeCountry.text(employeeInfo.nationality);
        $modalEmployeeBday.text(employeeInfo.birthday);

        //Save the index of the employee being shown in the modal
        currentEmployeeIndex = filteredEmployeeInfoCollection.indexOf(employeeInfo);
    }

    function closeModal(){
        $body.removeClass("modal-active");
    }
    
    function openModal(){
        $body.addClass("modal-active");
    }

    function getPrevNextEmployeeInModal(event){

        let nextEmployeeIndex = 0;

        //Increment or decrement current user index to get to the next or previous employee
        if(event.target.classList.contains("modal-next")){
            nextEmployeeIndex = currentEmployeeIndex+=1;

            //If the last employee is reached, go back to the first 
            if(nextEmployeeIndex >= filteredEmployeeInfoCollection.length){
                nextEmployeeIndex = 0;
            }
        }else{
            nextEmployeeIndex = currentEmployeeIndex-=1;

            //If the first employee is reached, go back to the last 
            if(nextEmployeeIndex < 0){
                nextEmployeeIndex = filteredEmployeeInfoCollection.length - 1;
            }
        }

        updateModal(filteredEmployeeInfoCollection[nextEmployeeIndex]);
    }

    function handleFilterKeypress(event){
    
        let filtered = [];
        //Get filter querry from the field
        let query = $(event.target).val().toLowerCase();

        //Loop though all the employees and chekc for name or username matches
        for(let i = 0; i < employeeInfoCollection.length; i++){
            
            let employee = employeeInfoCollection[i];

            if(
                employee.name.toLowerCase().indexOf(query) > -1 || 
                employee.username.toLowerCase().indexOf(query) > -1            
            ){
                filtered.push(employee);
            }                           
        }
        
        //The matches found to the array for the rest of the app to use
        filteredEmployeeInfoCollection = filtered;  
        renderEmeployeeList(); 
    }

    //The mockup calls for a 2-letter state abbreviation.
    //This method takes the full name the API provides and converts to a 2-letter code
    function abbreviateUsState(fullStateName){   

        let stateNameHash = {
            "alabama":"al",
            "alaska":"ak",
            "american samoa":"as",
            "arizona":"az",
            "arkansas":"ar",
            "california":"ca",
            "colorado":"co",
            "connecticut":"ct",
            "delaware":"de",
            "district of columbia": "dc",
            "federated states of micronesia":"fm",
            "florida":"fl",
            "georgia":"ga",
            "guam":"gu",
            "hawaii":"hi",
            "idaho":"id",
            "illinois":"il",
            "indiana":"in",
            "iowa":"ia",
            "kansas":"ks",
            "kentucky":"ky",
            "louisiana":"la",
            "maine":"me",
            "marshall islands":"mh",
            "maryland":"md",
            "massachusetts":"ma",
            "michigan":"mi",
            "minnesota":"mn",
            "mississippi":"ms",
            "missouri":"mo",
            "montana":"mt",
            "nebraska":"ne",
            "nevada":"nv",
            "new hampshire":"nh",
            "new jersey":"nj",
            "new mexico":"nm",
            "new york":"ny",
            "north carolina":"nc",
            "north dakota":"nd",
            "northern mariana islands":"mp",
            "ohio":"oh","oklahoma":
            "ok","oregon":"or","palau":"pw",
            "pennsylvania":"pa",
            "puerto rico":"pr",
            "rhode island":"ri",
            "south carolina":"sc",
            "south dakota":"sd",
            "tennessee":"tn",
            "texas":"tx",
            "utah":"ut",
            "vermont":"vt",
            "virgin islands":"vi",
            "virginia":"va",
            "washington":"wa",
            "west virginia":"wv",
            "wisconsin":"wi",
            "wyoming":"wy"
        }        

        return stateNameHash[fullStateName.toLowerCase()];
    }

    //Get full country name from API's "nat" property
    //Can be extended to support multiple countries
    function getCountryName(apiNat){   

        let countryNameHash = {
            "us": "USA"
        }        
        return countryNameHash[apiNat.toLowerCase()];
    }

    //Run the code on DOM ready
    $(document).ready(()=>{
        init();
    });
}