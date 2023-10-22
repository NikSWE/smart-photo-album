#!/bin/bash

if [ -d "package" ]; then
  rm -rf package
fi

if [ -f "search-photos-lambda-deployment-package.zip" ]; then
  rm search-photos-lambda-deployment-package.zip
fi

pip install -r requirements.txt -t ./package
cd package || exit
zip -r ../search-photos-lambda-deployment-package.zip .
cd ..
zip search-photos-lambda-deployment-package.zip search-photos-lambda.py