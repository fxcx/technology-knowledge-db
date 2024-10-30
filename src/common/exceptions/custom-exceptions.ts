import { HttpException, HttpStatus } from '@nestjs/common';

export class TechnologyNotFoundException extends HttpException {
  constructor(id: number) {
    super(`Technology with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateTechnologyException extends HttpException {
  constructor(name: string) {
    super(`Technology with name ${name} already exists`, HttpStatus.CONFLICT);
  }
}