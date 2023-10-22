import boto3
from elasticsearch import Elasticsearch, RequestsHttpConnection
from aws_requests_auth.aws_auth import AWSRequestsAuth
import json

rekognition_client = boto3.client('rekognition')
s3_client = boto3.client('s3')

elasticsearch_endpoint = 'search-photos-dhuzwwyajwmh3n7riogbpd7xby.us-east-1.es.amazonaws.com'

request_authorization = AWSRequestsAuth(
    aws_access_key='AKIAR54MBDE7KANBFHM5',
    aws_secret_access_key='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',
    aws_region='us-east-1',
    aws_service='es',
    aws_host=elasticsearch_endpoint
)

elasticsearch_client = Elasticsearch(
    hosts=[{
        'host': elasticsearch_endpoint,
        'port': 443
    }],
    http_auth=request_authorization,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection
)


def handler(event, context):
    for record in event['Records']:
        bucket_name = record['s3']['bucket']['name']
        object_key = record['s3']['object']['key']
        event_time = record['eventTime']

        rekognition_label_response = rekognition_client.detect_labels(
            Image={
                'S3Object': {
                    'Bucket': bucket_name,
                    'Name': object_key
                }
            }
        )

        s3_custom_metadata_response = s3_client.head_object(
            Bucket=bucket_name,
            Key=object_key
        )

        print(s3_custom_metadata_response)

        labels = list(entry['Name'] for entry in rekognition_label_response['Labels'])

        if 'customlabels' in s3_custom_metadata_response['Metadata']:
            labels.append(s3_custom_metadata_response['Metadata']['customlabels'])

        photo_labels_metadata_object = json.dumps({
            'objectKey': object_key,
            'bucket': bucket_name,
            'createdTimestamp': event_time,
            'labels': labels
        })

        elasticsearch_client.index(
            index='data',
            id=object_key,
            body=photo_labels_metadata_object,
            doc_type='doc'
        )
