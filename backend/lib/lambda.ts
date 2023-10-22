import {Duration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {Role} from "aws-cdk-lib/aws-iam";

export interface LambdaStackProps extends StackProps {
    readonly indexPhotosLambdaRole: Role,
    readonly searchPhotosLambdaRole: Role
}

export class LambdaStack extends Stack {
    public readonly indexPhotosLambdaFunction: Function;
    public readonly searchPhotosLambdaFunction: Function;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        this.indexPhotosLambdaFunction = new Function(this, 'IndexPhotos', {
            functionName: 'index-photos',
            runtime: Runtime.PYTHON_3_10,
            handler: 'index-photos-lambda.handler',
            code: Code.fromAsset('backend/assets/LF1-index-photos/index-photos-lambda-deployment-package.zip'),
            logRetention: RetentionDays.ONE_WEEK,
            role: props.indexPhotosLambdaRole,
            timeout: Duration.seconds(10)
        });

        this.searchPhotosLambdaFunction = new Function(this, 'SearchPhotos', {
            functionName: 'search-photos',
            runtime: Runtime.PYTHON_3_10,
            handler: 'search-photos-lambda.handler',
            code: Code.fromAsset('backend/assets/LF2-search-photos/search-photos-lambda-deployment-package.zip'),
            logRetention: RetentionDays.ONE_WEEK,
            role: props.searchPhotosLambdaRole,
            timeout: Duration.seconds(10)
        })
    }
}