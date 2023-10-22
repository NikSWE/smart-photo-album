import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {IdentityStack} from "./identity";
import {env} from './config';
import {S3Stack} from './s3';
import {LambdaStack} from './lambda';
import {OpensearchServiceStack} from "./opensearch-service";

export class PhotoAlbumAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const identity = new IdentityStack(this, 'IdentityStack', {
      env: env
    });

    const opensearchService = new OpensearchServiceStack(this, 'OpensearchServiceStack', {
      env: env
    });

    const lambda = new LambdaStack(this, 'LambdaStack', {
      env: env,
      indexPhotosLambdaRole: identity.indexPhotosLambdaRole,
      searchPhotosLambdaRole: identity.searchPhotosLambdaRole
    });
    lambda.addDependency(identity);

    const s3 = new S3Stack(this, 'S3Stack', {
      env: env,
      indexPhotosLambdaFunction: lambda.indexPhotosLambdaFunction,
    });
    s3.addDependency(lambda);
  }
}
