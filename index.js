// This version of the code will accept a requested filename and
// generate the targeted resolution.

// AWS SDK for Node.js
let AWS = require('aws-sdk');

// Sharp image library: https://github.com/lovell/sharp
let sharp = require('sharp');

// init AWS
let s3 = new AWS.S3();
const github_username = process.env.GITHUB_USERNAME;
const source_bucket_name = 'cs4540-fall2017-' + github_username + '-originals';
const target_bucket_name = 'cs4540-fall2017-' + github_username + '-sized';
// We no longer need these canned resolutions as we'll be
// generating them on demand.
// const resolutions = [[50, 50], [100,100], [500,500]];

// requested filenames must be in the form of:
// number "x" number ("-" or "_") filename
// e.g. 30x30-Rizzo.png or 200x200_Mypet.jpg
const fname_regex = /(\d+)x(\d+)[_-](.+)/

// get the url of the s3 bucket from the URL environment var
const URL = process.env.URL;

// Split the filename to get the resolution component, e.g.:
// given '30x30_Rizzo.png', return an array of [30,30]
function get_resolution_from_filename(requested_filename){
  result = requested_filename.match(fname_regex);
  dim_array = [parseInt(result[1]), parseInt(result[2])];
  return dim_array;
}

// Split the filename to get the original filename component, e.g.:
// given '30x30_Rizzo.png', return 'Rizzo.png'
function get_original_filename(requested_filename){
  result = requested_filename.match(fname_regex);
  return result[3];
}

// retrieve an original image from S3 (must already exist!)  Image is
// returned as param to success callback.
function async_get_object(image_name, success_callback, err_callback){
  s3.getObject(
    {Bucket: source_bucket_name, Key: image_name},
    function(err, data){
      if (err) {
        console.log('Unable to find: ' + source_bucket_name + ':' + image_name);
        err_callback(err);
      }
      else { success_callback(data); }
    }
  )
};

// verify that a file exists in the originals s3 bucket.
function async_file_exists(image_name, true_callback, false_callback, err_callback){
  s3.listObjects(
    { Bucket: source_bucket_name },
    function(err, data){
      if (err) { err_callback(err); }
      else {
        for (let i=0; i < data['Contents'].length; i++) {
          if (data['Contents'][i]['Key'] == image_name) { true_callback(); return; }
        }
        false_callback();
      }
    }
  )
};

// Accept an image in a buffer and save it out to the sized s3 bucket as a publicly readable item.
function async_save_to_s3(new_image_name, data, success_callback, err_callback){
  s3.putObject(
    { Bucket: target_bucket_name, Key: new_image_name, ACL: 'public-read', Body: data},
    function(err, data){
      if (err) { err_callback(err); }
      else { success_callback(data); }
    }
  );
}

// Main function to resize and save an image.  Image data must exist in a buffer first.
function async_generate_resolution_and_save(image_data, target_image_name, target_resolution, success_callback, err_callback){
  // resize the image to the target
  sharp(image_data['Body'])
    .resize( target_resolution[0], target_resolution[1])
    .toBuffer( function(err, data, info){
      if (err) { err_callback(err); }
      else { async_save_to_s3(target_image_name, data, success_callback, err_callback); }
    })
}

// testing
// target = '30x30_Rizzo.png';
// async_get_object(
//   target,
//   function(data){
//     for (let i=0; i < resolutions.length; i++){
//       generate_resolution_and_save(
//         data,
//         target,
//         function(){ console.log('New file created: ' + target + ' at ' + resolutions[i]); },
//         function(err){ console.log(err); }
//       );
//     }
//   },
//   function(err){
//     console.log('Unable to get the original file.');
//   }
// );





// What the event object looks like:
// { Records:
//    [ { eventVersion: '2.0',
//        eventTime: '1970-01-01T00:00:00.000Z',
//        requestParameters: [Object],
//        s3: [Object],
//        responseElements: [Object],
//        awsRegion: 'us-east-1',
//        eventName: 'ObjectCreated:Put',
//        userIdentity: [Object],
//        eventSource: 'aws:s3' } ] }
//
// Setup the Lambda function to have index.handler as its entry point.


exports.handler = (event, context, callback) => {
  // requested_filename is the file that does not yet exist,
  // e.g. 23x23_Rizzo.png
  let requested_filename = event['queryStringParameters']['requested_filename'];

  // requested resolution is [23,23]
  let requested_resolution = get_resolution_from_filename(requested_filename);

  // original filename is Rizzo.png
  let original_filename = get_original_filename(requested_filename);

  async_get_object(
    original_filename,
    function(data){
      async_generate_resolution_and_save(
        data,
        requested_filename,
        requested_resolution,
        function(){
          console.log('New file created: ' + requested_filename + ' at ' + requested_resolution);
          console.log('Returning a redirect response to: ' + `${URL}/${requested_filename}`);
          callback(null, {
            statusCode: '301',
            headers: { 'location':  `${URL}/${requested_filename}`},
            body: '',
          })
        },
        function(err){ console.log(err); }
      );
    },
    function(err){
      console.log('Unable to get the original file.');
    }
  );
}
