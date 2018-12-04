import { Injectable, HttpService } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { User } from './model/user';

@Injectable()
export class AppService {
  
  constructor(private http: HttpService) {
    
  }
  
  root(): string {
    return 'Hello World!';
  }

  getUsers(){
    //return //[{
      //name: 'rohan', age: 21, email: 'rohanmehto1910@gmail.com'
    //}]
    return this.http.get('http://localhost:3000')
            .pipe(
                map(response => response.data)
            ); 
  }

  incAge(userObj){
    userObj.age = userObj.age + 1;
    return userObj;
  }
}
