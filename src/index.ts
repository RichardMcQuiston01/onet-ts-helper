import { OnetWebServicesHelper } from "./onet-web-services.helper";
import 'dotenv/config';

console.log( 'Starting Script' );

const helper = new OnetWebServicesHelper( {
  username: process.env.ONET_USERNAME || '',
  password: process.env.ONET_PASSWORD || ''
} )
  .setBaseUrl( 'https://services.onetcenter.org/ws/' )
  .setToken()

helper.getJobZones().then( ( res ) => {
  console.log( res );
} );