import * as path from 'path';
import { Construct } from '@aws-cdk/core';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Rule } from '@aws-cdk/aws-events';

export interface SlackNotifierProps {
    slackBotToken: string;
    slackSigningSecret: string;
    slackChannelName: string;
    slackBotName?: string;
    slackBotIcon?: string;
    pipeline: Pipeline;
    stageNames?: string[];
}

export class SlackNotifier extends Construct {
    constructor(scope: Construct, id: string, props: SlackNotifierProps) {
        super(scope, id);

        const {
            slackBotToken,
            slackSigningSecret,
            slackChannelName,
            slackBotName,
            slackBotIcon,
            pipeline,
            stageNames,
        } = props;

        const environment: Record<string, string> = {
            SLACK_BOT_TOKEN: slackBotToken,
            SLACK_SIGNING_SECRET: slackSigningSecret,
            SLACK_CHANNEL_NAME: slackChannelName,
        };

        if (slackBotName) {
            environment.SLACK_BOT_NAME = slackBotName;
        }

        if (slackBotIcon) {
            environment.SLACK_BOT_ICON = slackBotIcon;
        }

        const notifier = new Function(scope, 'SlackNotifierFunction', {
            runtime: Runtime.NODEJS_10_X,
            handler: 'lib/notifier.handler',
            code: Code.asset(
                path.join(__dirname, '..', 'lambda', 'bundle.zip'),
            ),
            environment,
        });

        pipeline.onStateChange('SlackPipelineNotifierRule', {
            target: new LambdaFunction(notifier),
        });

        const stageRule = new Rule(this, 'SlackStageNotifierRule');

        stageRule.addTarget(new LambdaFunction(notifier));

        stageRule.addEventPattern({
            source: ['aws.codepipeline'],
            resources: [pipeline.pipelineArn],
            detailType: ['CodePipeline Stage Execution State Change'],
        });

        if (stageNames) {
            stageRule.addEventPattern({
                detail: {
                    stage: stageNames,
                },
            });
        }
    }
}