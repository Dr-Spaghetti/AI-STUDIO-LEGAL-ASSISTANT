import React from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { Input, Button, Dropdown } from './ui';

interface ClientIntakeFormProps {
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

const ClientIntakeForm: React.FC<ClientIntakeFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useFormValidation({
      name: '',
      email: '',
      phone: '',
      caseType: '',
      appointment: '',
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateAll()) {
      onSubmit?.(values);
    }
  };

  const caseTypes = [
    { value: 'personal-injury', label: 'Personal Injury' },
    { value: 'family-law', label: 'Family Law' },
    { value: 'criminal', label: 'Criminal Law' },
    { value: 'corporate', label: 'Corporate Law' },
    { value: 'estate', label: 'Estate Planning' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <Input
        label="Full Name"
        name="name"
        type="text"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name ? errors.name : undefined}
        placeholder="John Doe"
      />

      {/* Email Field */}
      <Input
        label="Email Address"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email ? errors.email : undefined}
        placeholder="john@example.com"
      />

      {/* Phone Field */}
      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        value={values.phone}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.phone ? errors.phone : undefined}
        placeholder="(555) 123-4567"
      />

      {/* Case Type Dropdown */}
      <Dropdown
        label="Type of Case"
        options={caseTypes}
        value={values.caseType}
        onChange={(value) => handleChange({ target: { name: 'caseType', value } } as any)}
        error={touched.caseType ? errors.caseType : undefined}
        placeholder="Select a case type"
      />

      {/* Appointment Date/Time */}
      <Input
        label="Preferred Appointment"
        name="appointment"
        type="datetime-local"
        value={values.appointment}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.appointment ? errors.appointment : undefined}
      />

      {/* Submit Button */}
      <Button
        variant="primary"
        size="md"
        isLoading={isLoading}
        type="submit"
        className="w-full"
      >
        {isLoading ? 'Submitting...' : 'Schedule Consultation'}
      </Button>
    </form>
  );
};

export default ClientIntakeForm;
