import awsLambdaFastify from '@fastify/aws-lambda';
import app from './app';

export const handler = async (event: any, context: any) => {
  const lambdaHandler = awsLambdaFastify(app, {
    callbackWaitsForEmptyEventLoop: false,
    decorateRequest: false,
  });
  return lambdaHandler(event, context);
};
