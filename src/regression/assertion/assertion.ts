import {HttpResponseStack} from '../stack/http-response-stack';
import {AssertionResult} from './assertion-result';

export interface Assertion {
    (result: HttpResponseStack): AssertionResult;
}