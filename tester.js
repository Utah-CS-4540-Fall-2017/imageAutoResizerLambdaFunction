mylib = require('./index.js');


event = {
  "Records": [
    {
      "eventVersion": "2.0",
      "eventTime": "1970-01-01T00:00:00.000Z",
      "requestParameters": {
        "sourceIPAddress": "127.0.0.1"
      },
      "s3": {
        "configurationId": "testConfigRule",
        "object": {
          "eTag": "0123456789abcdef0123456789abcdef",
          "sequencer": "0A1B2C3D4E5F678901",
          "key": "Rizzo.png",
          "size": 1024
        },
        "bucket": {
          "arn": 'bucketarn',
          "name": "sourcebucket",
          "ownerIdentity": {
            "principalId": "EXAMPLE"
          }
        },
        "s3SchemaVersion": "1.0"
      },
      "responseElements": {
        "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH",
        "x-amz-request-id": "EXAMPLE123456789"
      },
      "awsRegion": "us-east-1",
      "eventName": "ObjectCreated:Put",
      "userIdentity": {
        "principalId": "EXAMPLE"
      },
      "eventSource": "aws:s3"
    }
  ]
}

context = {
    'aws_request_id': 'a3de505e-f16b-42f4-b3e6-bcd2e4a73903',
    'log_stream_name': '2015/10/26/[$LATEST]c71058d852474b9895a0f221f73402ad',
    'invoked_function_arn': 'arn:aws:lambda:us-west-2:123456789012:function:ExampleCloudFormationStackName-ExampleLambdaFunctionResourceName-AULC3LB8Q02F',
    'client_context': 'None',
    'log_group_name': '/aws/lambda/ExampleCloudFormationStackName-ExampleLambdaFunctionResourceName-AULC3LB8Q02F',
    'function_name': 'ExampleCloudFormationStackName-ExampleLambdaFunctionResourceName-AULC3LB8Q02F',
    'function_version': '$LATEST',
    'identity': '<__main__.CognitoIdentity object at 0x7fd7042a2b90>',
    'memory_limit_in_mb': '128'
}

mylib.handler(event, context);
