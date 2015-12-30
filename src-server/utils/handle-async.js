import _ from "lodash";
import isGenerator from "./is-generator";

export default async function handleAync(returnValue) {
    var iterateGenerator = function (generator, resolve, reject, value) {
        try {
           var result = generator.next(value);

           if (result.done === true)  {
               resolve(result.value);
               return;
           }

           // Wait for Promise
           if (_.isFunction(result.value.then))
           {
               result.value.then(value => {
                   iterateGenerator(generator, resolve, reject, value);
               });
               return;
           }

           // generate next if not done
           iterateGenerator(generator, resolve, reject);
           return;
       }
       catch (e) {
           reject(e);
       }
    };

    return new Promise((resolve, reject) => {
        if (returnValue == null) {
            resolve(returnValue);
        }
        else if (isGenerator(returnValue)) {
            iterateGenerator(returnValue, resolve, reject);
        }
        else if (_.isFunction(returnValue.then)) {
            returnValue.then(resolve, reject);
        }
        else {
            resolve(returnValue);
        }
    });
}
