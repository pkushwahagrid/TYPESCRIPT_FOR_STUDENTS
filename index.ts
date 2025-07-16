type HTTPMethod = "POST" | "GET";
type HTTPStatus = 200 | 500;

interface ObserverHandlers<T, E = Error> {
  next?: (value: T) => void;
  error?: (error: E) => void;
  complete?: () => void;
}

interface CustomRequest {
  method: HTTPMethod;
  host: string;
  path: string;
  body?: unknown;
  params: Record<string, string>;
}

interface CustomResponse {
  status: HTTPStatus;
}

interface Subscription {
  unsubscribe: () => void;
}

class Observer<T, E = Error> {
  private isUnsubscribed: boolean = false;
  // Made public to allow Observable to set it
  public _unsubscribe?: () => void;

  constructor(private handlers: ObserverHandlers<T, E>) {}

  next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: E): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe(): void {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable<T, E = Error> {
  constructor(private _subscribe: (observer: Observer<T, E>) => () => void) {}

  static from<T>(values: T[]): Observable<T> {
    return new Observable<T>((observer) => {
      values.forEach((value) => observer.next(value));
      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: ObserverHandlers<T, E>): Subscription {
    const observer = new Observer(obs);
    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const HTTP_POST_METHOD: HTTPMethod = "POST";
const HTTP_GET_METHOD: HTTPMethod = "GET";

const HTTP_STATUS_OK: HTTPStatus = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR: HTTPStatus = 500;

interface User {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
}

const userMock: User = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: CustomRequest[] = [
  {
    method: HTTP_POST_METHOD,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (request: CustomRequest): CustomResponse => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};

interface CustomError {
  message: string;
  code?: number;
  details?: unknown;
}

const handleError = (error: CustomError): CustomResponse => {
  // handling of error
  console.error("Error occurred:", error.message);
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => console.log("complete");

const requests$ = Observable.from<CustomRequest>(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
