import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  HostListener,
  OnInit,
  ChangeDetectorRef,
  forwardRef,
} from '@angular/core';
import {
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors,
  Validator,
  ControlContainer,
} from '@angular/forms';

@Directive({
  standalone: true,
  selector: '[appCustomValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CustomValidator),
      multi: true,
    },
  ],
})
export class CustomValidator implements Validator, OnInit{
  @Input() appCustomValidator: string = ''; // Takes validation type(s) as input
  private errorContainer?: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private controlContainer: ControlContainer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Check if error container already exists
    this.errorContainer = this.el.nativeElement.parentNode.querySelector(
      '.custom-error-container'
    );

    if (!this.errorContainer) {
      // Create an error message container below the form field
      this.errorContainer = this.renderer.createElement('div');
      this.renderer.setStyle(this.errorContainer, 'color', 'red');
      this.renderer.setStyle(this.errorContainer, 'font-size', '10px');
      this.renderer.setStyle(this.errorContainer, 'padding-left', '5px');
      this.renderer.setStyle(this.errorContainer, 'margin-top', '-2px'); // Adds space between input and error message
      this.renderer.setStyle(this.errorContainer, 'visibility', 'hidden'); // Initially hidden but space reserved
      this.renderer.setStyle(this.errorContainer, 'height', '10px'); // Reserve fixed height for error message (change this if you need a bigger or smaller space)
      this.renderer.setStyle(
        this.errorContainer,
        'transition',
        'visibility 0s, opacity 0.3s ease-in-out, height 0s ease-out'
      );
      this.renderer.setStyle(this.errorContainer, 'opacity', '0'); // Initially hidden, no opacity

      // Add a class to easily select and manage the error container
      this.renderer.addClass(this.errorContainer, 'custom-error-container');

      // Append the error container below the input field
      this.renderer.appendChild(
        this.el.nativeElement.parentNode,
        this.errorContainer
      );
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    // Check if the control is disabled or readonly
    const isReadOnly =
      this.el.nativeElement.hasAttribute('readonly') || control.disabled;

    // If the control is readonly or disabled, skip validation
    if (isReadOnly) {
      return null; // No validation errors
    }

    const value = control.value;
    const validators: string[] = this.appCustomValidator.split(',');
    let validationErrors: ValidationErrors = {};

    // Custom validations (required, email, aadhar, pan, phone, file, number, onlyChars, ifsc, division, grade)
    validators.forEach((validator) => {
      if (validator === 'required' && !value) {
        validationErrors['required'] = 'This field is required.';
      } else if (validator === 'email' && !this.isValidEmail(value)) {
        validationErrors['email'] = 'This field must be a valid email address.';
      } else if (validator === 'aadhar' && !this.isValidAadhar(value)) {
        validationErrors['aadhar'] = 'Aadhar number must be a 12-digit number.';
      } else if (validator === 'phone' && !this.isValidPhone(value)) {
        validationErrors['phone'] = 'Phone number must be valid (10 digits).';
      } else if (validator === 'number' && !this.isValidNumber(value)) {
        validationErrors['number'] = 'This field must be a valid number.';
      } else if (validator === 'onlyChars' && !this.isValidOnlyChars(value)) {
        validationErrors['onlyChars'] =
          'This field must only contain alphabetic characters.';
      } else if (validator === 'noWhitespace' && !this.isValidNoWhitespace(value)) {
        validationErrors['noWhitespace'] = 'Whitespace is not allowed.';
      }


    });

    // Show error message only if the control is touched and invalid
    if (control.touched && Object.keys(validationErrors).length > 0) {
      this.setErrorMessage(validationErrors);
      return validationErrors;
    } else {
      this.hideErrorMessage();
      return null;
    }
  }

  private setErrorMessage(errors: ValidationErrors): void {
    let message = '';
    if (errors['required']) {
      message += errors['required'] + ' ';
    } else if (errors['email']) {
      message += errors['email'] + ' ';
    } else if (errors['aadhar']) {
      message += errors['aadhar'] + ' ';
    } else if (errors['phone']) {
      message += errors['phone'] + ' ';
    } else if (errors['number']) {
      message += errors['number'] + ' ';
    } else if (errors['onlyChars']) {
      message += errors['onlyChars'] + ' ';
    } else if (errors['noWhitespace']) {
      message += errors['noWhitespace'] + ' ';
    }


    // Set the error message in the error container
    this.renderer.setProperty(this.errorContainer, 'innerHTML', message.trim());
    this.renderer.setStyle(this.errorContainer, 'visibility', 'visible'); // Make the error message visible
    this.renderer.setStyle(this.errorContainer, 'opacity', '1'); // Fade the message in
    this.renderer.setStyle(this.errorContainer, 'height', '10px'); // Set height to keep the space allocated
  }

  private hideErrorMessage(): void {
    this.renderer.setStyle(this.errorContainer, 'visibility', 'hidden'); // Hide the message but keep space occupied
    this.renderer.setStyle(this.errorContainer, 'height', '10px'); // Keep the space reserved (fixed height)
    this.renderer.setStyle(this.errorContainer, 'opacity', '0'); // Make it invisible
  }

  private isValidEmail(value: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(value);
  }

  private isValidAadhar(value: string): boolean {
    const regex = /^[0-9]{12}$/; // 12-digit number
    return regex.test(value);
  }


  private isValidPhone(value: string): boolean {
    const regex = /^[0-9]{10}$/; // 10-digit phone number
    return regex.test(value);
  }

  private isValidNumber(value: any): boolean {
    // Check if the value is a valid number
    return !isNaN(value) && value !== '';
  }

  private isValidOnlyChars(value: string): boolean {
    // Validate that the input contains only alphabetic characters and spaces
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(value);
  }
  private isValidNoWhitespace(value: any): boolean {
    if (value == null) return true; // null/undefined case
    if (typeof value !== 'string') return true; // sirf string pe noWhitespace check chale
    return value.trim().length === value.length;
  }



  // Listen to the 'blur' event to trigger validation when the input loses focus
  @HostListener('blur', ['$event'])
  onBlur(event: any) {
    // Use ControlContainer to get the parent form control
    const formControl = this.controlContainer.control?.get(
      this.el.nativeElement.getAttribute('formControlName')
    );
    if (formControl) {
      // Mark the control as touched explicitly
      formControl.markAsTouched();

      // Perform validation
      this.validate(formControl);

      // Manually trigger change detection
      this.cdr.detectChanges();
    }
  }
}