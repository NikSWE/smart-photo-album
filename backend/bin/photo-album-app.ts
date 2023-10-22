#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PhotoAlbumAppStack } from '../lib/photo-album-app-stack';
import {env} from "../lib/config";

const app = new cdk.App();
new PhotoAlbumAppStack(app, 'PhotoAlbumAppStack', {
    env: env
});