import axios, { AxiosRequestConfig } from 'axios';
import { Buffer } from "buffer";
import { ParsedUrlQueryInput, stringify } from "querystring";
import { RIASECDto } from "./dto";
import { ApiResponseI } from "./interface";
import { InterestArea } from "./types";

export class OnetWebServicesHelper {
  private username: string;
  private password: string;
  private token: string;
  private config: AxiosRequestConfig;

  constructor( args = {} ) {
    for( const key of Object.keys( this ) ) {
      if( args[key] !== undefined ) {
        this[key] = args[key];
      }
    }

    this.setConfiguration();
    this.setBaseUrl();

    return this;
  }

  //#region Getters and Setters
  setCredentials( _username: string, _password: string ) {
    this.username = _username;
    this.password = _password;

    return this;
  }

  setBaseUrl( _url = '' ): OnetWebServicesHelper {
    this.config.baseURL = ( _url !== '' ) ? _url : 'https://services.onetcenter.org/ws/';

    return this;
  }

  setToken( _token = '' ): OnetWebServicesHelper {
    if( _token !== '' ) {
      this.token = _token;
    } else if( this.username !== '' && this.password !== '' ) {
      const encodeString = `${ this.username }:${ this.password }`;

      this.token = Buffer.from( encodeString, 'binary' ).toString( 'base64' );
    }

    this.config.headers['Authorization'] = `Basic ${ this.token }`;
    return this;
  }

  //#endregion

  //#region Core Functions
  isConfigInitialized(): boolean {
    return ( Object.keys( this.config ).length > 0 );
  }

  setConfiguration(): OnetWebServicesHelper {
    this.config = {
      baseURL: '',
      url: '',
      method: 'GET',
      headers: {
        'User-Agent': 'nodejs-OnetWebService/1.00 (bot)',
        'Accept': 'application/json',
        'Authorization': `Basic ${ this.token }`
      },
      timeout: 10000,
      maxRedirects: 0
    };

    return this;
  }

  async callAPI( url: string, query = {} ): Promise<ApiResponseI> {
    const response = { success: false, data: {}, errors: [] };

    try {
      let config = { ...this.config };
      const paramString = ( Object.keys( query ).length > 0 ) ? '?' + stringify( query as ParsedUrlQueryInput ) : '';

      config.url = url + paramString;

      console.log( config );

      const result = await axios( config as AxiosRequestConfig )

      if( result.status === 200 ) {
        response.data = result.data;
      } else {
        response.errors.push( `Call to ${ config.baseURL }${ config.url } failed with error code ${ result.status }` );
      }
    } catch( error ) {
      console.error( error.toString() );
      response.errors.push( error.toString() );

      if( error.response ) {
        if( error.response.status == 422 ) {
          response.data = error.response.data;
        } else {
          response.errors.push( `Call to ${ this.config.baseURL }${ this.config.url } failed with error code ${ error.response.status }` );
        }
      } else if( error.request ) {
        response.errors.push( `Call to ${ this.config.baseURL }${ this.config.url } failed with no response from server` );
      } else if( error.message ) {
        response.errors.push( `Call to ${ this.config.baseURL }${ this.config.url } failed with reason ${ error.message }` );
      }
    }

    return response;
  }

//#endregion

//#region Interest Profiler
  async getJobZones(): Promise<ApiResponseI> {
    return await this.callAPI( 'mnm/interestprofiler/job_zones', {} );
  }

  async getInterestProfiler30( start = 1, end = 30 ): Promise<ApiResponseI> {
    return await this.callAPI( 'mnm/interestprofiler/questions_30', {
      start: start,
      end: end
    } );
  }

  async getInterestProfiler60( start = 1, end = 60 )
    : Promise<ApiResponseI> {
    return await this.callAPI( 'mnm/interestprofiler/questions', {
      start: start,
      end: end
    } );
  }

  async getInterestProfilerResults( answers: string ): Promise<ApiResponseI> {
    return await this.callAPI( 'mnm/interestprofiler/results', { answers: answers } );
  }

  async getInterestProfilerMatchingCareersByAnswers( answers: string, jobZone = 0
  ):
    Promise<ApiResponseI> {
    const params = { answers: answers };

    if( jobZone > 0 && jobZone < 6
    ) {
      params['job_zone'] = jobZone;
    }

    return await this.callAPI( 'mnm/interestprofiler/careers', params );
  }

  async getInterestProfilerMatchingCareersByRIASEC( params: RIASECDto ) {
    return await this.callAPI( 'mnm/interestprofiler/careers', params );
  }

  async getInterestProfilerResultsByArea( area: InterestArea, jobZone = 0 ): Promise<ApiResponseI> {
    const params = { area: area };

    if( jobZone > 0 && jobZone < 6
    ) {
      params['job_zone'] = jobZone;
    }

    return await this.callAPI( 'mnm/interestprofiler/results', params );
  }

//#endregion
}