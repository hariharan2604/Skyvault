var viewBTN = document.getElementById("viewBTN");
viewBTN.addEventListener("click",()=>{
    var pwdField = document.getElementById("password");
    var toggler = document.getElementById("viewBTN");

    if(pwdField.type==="password"){
        pwdField.type="text";
        toggler.textContent = "hide";
    }
    else{
        pwdField.type="password";
        toggler.textContent = "view";
    }
});

$("#LoginBTN").on('click',function(){
  localStorage.setItem('email',$("#emailID").val());
});
// $(document).ready(function(){
//     var formData = new FormData(); // Create FormData object
//   var fileInput = $('#fileInput')[0].files[0]; // Get the file from input field
//   formData.append('email',"nm17@gmail.com");
//     $.ajax({
//         url: 'http://localhost:3000/getFiles',
//         type: 'POST',
//         data: formData,
//         processData: false, // Prevent jQuery from automatically transforming data into a query string
//         contentType: false, // Prevent jQuery from automatically setting the Content-Type header
//         success: function (response) {
//           console.log(response);
//           let file=`<a href='${response.link+response.filesArray[0].file}'>${response.filesArray[0].file}</a>`
//           $("#test").html(file);
//           console.log('File uploaded successfully');
//         },
//         error: function (xhr, status, error) {
//           console.error('File upload failed');
//         }
//       });
// })
