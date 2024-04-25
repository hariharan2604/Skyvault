function logoutRoute() {
  window.location.href = '/logout';
}

$(document).ready(function(){
  
  
  var formData = new FormData(); // Create FormData object
// var fileInput = $('#fileInput')[0].files[0]; // Get the file from input field
// formData.append('email',"nm17@gmail.com");
  $.ajax({
      url: 'http://localhost:3000/getFiles',
      type: 'POST',
      data: {email:localStorage.getItem('email')},
      // processData: false, // Prevent jQuery from automatically transforming data into a query string
      // contentType: false, // Prevent jQuery from automatically setting the Content-Type header
      success: function (response) {
        console.log(response);
        let filesHtml = ''; // Initialize an empty string to store HTML for all files

        // Loop through each file in the filesArray
        response.filesArray.forEach(function (fileObj) {
            // Construct the anchor tag for each file and append to filesHtml
            filesHtml += `<div><span><a href='${response.link + fileObj.file}'>${fileObj.originalname}</a><br></span><button id='deleteFile' data-id='${localStorage.getItem('email')+"/"+fileObj.file}'>Delete</button><br></div>`;
        });

        // Set the HTML content of #test to the generated file links
        $("#test").html(filesHtml);
        buttonset();
      },
      error: function (xhr, status, error) {
        console.error('File upload failed');
      }
    });
console.log($('button[data-id]'));
    
})
console.log($('button[data-id]'));
function buttonset(params) {
  

$('button[data-id]').each(function(){$(this).click(function() {
  var fileId = $(this).data('id');
  var parentSpan = $(this).parent() ;
  console.log(fileId);
  $.ajax({
    url: 'http://localhost:3000/delete',
    type: 'POST',
    data: {file: fileId},
    success: function(response) {
      console.log(response);
      parentSpan.remove();
    },
    error: function() {
      console.error('File Deletion failed');
    }
  });
})});
}
// $(document).ready(function() {
$('#uploadForm').click(function (event) {
  // event.preventDefault(); // Prevent default form submission
  var formData = new FormData(); // Create FormData object
  var fileInput = $('#fileInput')[0].files[0]; // Get the file from input field
  console.log(fileInput);
  formData.append('file', fileInput); // Append file to FormData object
  formData.append('original_name', fileInput.name); // Append file to FormData object
  formData.append('email',localStorage.getItem('email'));
  // Send AJAX request
  $.ajax({
    url: 'http://localhost:3000/upload',
    type: 'POST',
    data: formData,
    processData: false, // Prevent jQuery from automatically transforming data into a query string
    contentType: false, // Prevent jQuery from automatically setting the Content-Type header
    success: function (response) {
      console.log(response);
      if(response.code==200){
      let fileLink=response.link.split('/');        
      const filename = fileLink[fileLink.length - 1];
      let files=$("#test").html();
      let name=response.link.split('/')
      let file=`<div><span><a href='${response.link}'>${fileInput.name}</a></span><button id="deleteFile" data-id='${localStorage.getItem('email')+"/"+name[name.length-1]}'>Delete</button><br></div>`
      $("#test").html(file+"<br>"+files);
      $("#status").html("");
      console.log('File uploaded successfully');
      }
      else if(response.code==500){
        $("#status").html(response.message);
      }
    },
    error: function (xhr, status, error) {
      console.error('File upload failed');
    }
  });
});
buttonset();


// const cameraButton = document.getElementById('cameraBTN');
// const captureButton = document.getElementById('captureBTN');
// const cameraOutput = document.getElementById('camOutput');
// let stream;
// let videoTrack;

// cameraButton.addEventListener('click', async () => {
//     try {
//         stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         const video = document.createElement('video');
//         cameraOutput.appendChild(video);
//         video.srcObject = stream;
//         video.play();
//         videoTrack = stream.getVideoTracks()[0];
//         captureButton.style.display = 'block';
//     } catch (error) {
//         console.error('Error accessing camera:', error);
//     }
// });

// captureButton.addEventListener('click', () => {
//     const canvas = document.createElement('canvas');
//     canvas.width = videoTrack.getSettings().width;
//     canvas.height = videoTrack.getSettings().height;
//     const context = canvas.getContext('2d');
//     context.drawImage(videoTrack, 0, 0, canvas.width, canvas.height);

//     canvas.toBlob(blob => {
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = 'image1.jpg';
//         link.click();
//     }, 'image/jpeg');
// });
