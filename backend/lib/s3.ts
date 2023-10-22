import {Arn, ArnFormat, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Bucket, EventType} from "aws-cdk-lib/aws-s3";
import {Function} from "aws-cdk-lib/aws-lambda";
import {S3EventSource} from "aws-cdk-lib/aws-lambda-event-sources";
import {Role} from "aws-cdk-lib/aws-iam";

export interface S3StackProps extends StackProps {
    readonly indexPhotosLambdaFunction: Function,
}

export class S3Stack extends Stack {
    constructor(scope: Construct, id: string, props: S3StackProps) {
        super(scope, id, props);

         const photosBucket = new Bucket(this, 'PhotosBucket', {
             bucketName: 'store-album-bucket',
             removalPolicy: RemovalPolicy.DESTROY,
         });

        props.indexPhotosLambdaFunction.addEventSource(new S3EventSource(photosBucket, {
            events: [EventType.OBJECT_CREATED_PUT]
        }));
    }
}