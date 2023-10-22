import {Arn, ArnFormat, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";

export class IdentityStack extends Stack {
    public readonly indexPhotosLambdaRole: Role;
    public readonly searchPhotosLambdaRole: Role;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.indexPhotosLambdaRole = new Role(this, 'IndexPhotosLambdaRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            inlinePolicies: {
                RekognitionAccessPolicy: this.getLambdaRekognitionAccessRole(),
                CloudWatchLogsAccessPolicy: this.getLambdaCloudWatchLogsAccessPolicy(),
                PhotoAlbumBucketAccessPolicy: this.getPhotoAlbumBucketAccessPolicy(),
                OpensearchAccessPolicy: this.getOpensearchServiceAccessPolicy()
            }
        });

        this.searchPhotosLambdaRole = new Role(this, 'SearchPhotosLambdaRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            inlinePolicies: {
                CloudWatchLogsAccessPolicy: this.getLambdaCloudWatchLogsAccessPolicy(),
                PhotoAlbumBucketAccessPolicy: this.getPhotoAlbumBucketAccessPolicy(),
                OpensearchAccessPolicy: this.getOpensearchServiceAccessPolicy()
            }
        });
    }

    private getLambdaRekognitionAccessRole(): PolicyDocument {
        return new PolicyDocument({
            statements: [
                new PolicyStatement({
                    actions: [
                        'rekognition:DetectLabels'
                    ],
                    effect: Effect.ALLOW,
                    resources: ['*']
                })
            ]
        });
    }

    private getLambdaCloudWatchLogsAccessPolicy(): PolicyDocument {
        return new PolicyDocument({
            statements: [
                new PolicyStatement({
                    actions: [
                        'logs:CreateLogGroup',
                        'logs:CreateLogStream',
                        'logs:PutLogEvents'
                    ],
                    effect: Effect.ALLOW,
                    resources: ['*']
                })
            ]
        });
    }

    private getPhotoAlbumBucketAccessPolicy(): PolicyDocument {
        return new PolicyDocument({
            statements: [
                new PolicyStatement({
                    actions: [
                        's3:GetObject',
                    ],
                    effect: Effect.ALLOW,
                    resources: [
                        Arn.format(
                            {
                                arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
                                service: 's3',
                                resource: 'store-album-bucket',
                                resourceName: '*',
                                region: '',
                                account: ''
                            },
                            this
                        )
                    ]
                })
            ]
        });
    }

    private getOpensearchServiceAccessPolicy(): PolicyDocument {
        return new PolicyDocument({
            statements: [
                new PolicyStatement({
                    actions: [
                        'es:ESHttpGet',
                        'es:ESHttpPut'
                    ],
                    effect: Effect.ALLOW,
                    resources: [
                        Arn.format(
                            {
                                arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
                                service: 'es',
                                resource: 'domain',
                                resourceName: 'photos/*',
                            },
                            this
                        )
                    ]
                })
            ]
        });
    }
}