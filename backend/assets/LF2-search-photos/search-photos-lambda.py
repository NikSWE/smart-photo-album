import boto3

from elasticsearch import Elasticsearch, RequestsHttpConnection
from aws_requests_auth.aws_auth import AWSRequestsAuth

lex_client = boto3.client('lex-runtime')

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
    user_query = event['q']

    user_query_disambiguation_response = lex_client.post_text(
        botName='DisambiguationBot',
        botAlias='dev',
        userId='user',
        inputText=user_query
    )

    keywords = [keyword for keyword in user_query_disambiguation_response['slots'] if keyword is not None]
    print(keywords)

    if len(keywords) == 0:
        return {
            'results': []
        }

    body = {}

    if len(keywords) == 1:
        body = {
            'query': {
                'match': {
                    'labels': keywords[0]
                }
            }
        }
    else:
        body = {
            'query': {
                'bool': {
                    'must': [
                        {'match': {'labels': keywords[0]}},
                        {'match': {'labels': keywords[1]}}
                    ]
                }
            }
        }

    possible_photos = elasticsearch_client.search(
        index='photos',
        body=body
    )

    print(possible_photos)

    results = []
    for entry in possible_photos['hits']['hits']:
        results.append({
            'url': f'https://{entry["_source"].get("bucket")}.s3.amazonaws.com/{entry["_source"].get("objectKey")}',
            'labels': entry["_source"].get('labels')
        })

    print(results)

    return {
        'results': results
    }
