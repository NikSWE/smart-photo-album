import {Arn, ArnFormat, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Domain, EngineVersion} from "aws-cdk-lib/aws-opensearchservice";
import {EbsDeviceVolumeType} from "aws-cdk-lib/aws-ec2";
import {AccountPrincipal, ArnPrincipal, Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

export class OpensearchServiceStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const photosDomain = new Domain(this, 'PhotosDomain', {
            version: EngineVersion.ELASTICSEARCH_6_7,
            nodeToNodeEncryption: true,
            encryptionAtRest: {
                enabled: true
            },
            domainName: 'photos',
            ebs: {
                volumeSize: 10,
                volumeType: EbsDeviceVolumeType.GP2
            },
            capacity: {
                dataNodeInstanceType: 't3.small.search',
                dataNodes: 1,
                multiAzWithStandbyEnabled: false
            },
            zoneAwareness: {
                enabled: false
            },
            accessPolicies: [
                new PolicyStatement({
                    actions: [
                        'es:ESHttpGet',
                        'es:ESHttpPut'
                    ],
                    effect: Effect.ALLOW,
                    principals: [
                        new ArnPrincipal(
                            Arn.format(
                                {
                                    arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
                                    service: 'iam',
                                    resource: 'user',
                                    resourceName: 'ishantaldekar',
                                    region: ''
                                },
                                this
                            )
                        ),
                        new AccountPrincipal(props.env!.account)
                    ],
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