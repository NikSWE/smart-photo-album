#!/bin/bash

if [ -d "package" ]; then
  rm -rf package
fi

if [ -f "index-photos-lambda-deployment-package.zip" ]; then
  rm index-photos-lambda-deployment-package.zip
fi

pip install -r requirements.txt -t ./package
cd package || exit
zip -r ../index-photos-lambda-deployment-package.zip .
cd ..
zip index-photos-lambda-deployment-package.zip index-photos-lambda.py