import React, { useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import {
  ValidatedFormField,
  Card,
  Badge,
  Button,
  Dropdown,
  Modal,
} from './ui';

interface AdvancedClientFormProps {
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

const AdvancedClientForm: React.FC<AdvancedClientFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useFormValidation({
      name: '',
      email: '',
      phone: '',
      caseType: '',
      caseUrgency: 'normal',
      message: '',
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateAll()) {
      setShowConfirmation(true);
    }
  };

  const confirmSubmit = () => {
    setShowConfirmation(false);
    setFormSubmitted(true);
    onSubmit?.(values);
    setTimeout(() => setFormSubmitted(false), 2000);
  };

  const caseTypes = [
    { value: 'personal-injury', label: 'Personal Injury' },
    { value: 'family-law', label: 'Family Law' },
    { value: 'criminal', label: 'Criminal Law' },
    { value: 'corporate', label: 'Corporate Law' },
    { value: 'estate', label: 'Estate Planning' },
    { value: 'bankruptcy', label: 'Bankruptcy' },
    { value: 'other', label: 'Other' },
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - General Inquiry' },
    { value: 'normal', label: 'Normal - Standard Consultation' },
    { value: 'high', label: 'High - Time Sensitive' },
    { value: 'urgent', label: 'Urgent - Immediate Help Needed' },
  ];

  return (
    <>
      <Card
        title="Client Intake Form"
        subtitle="Please provide your information and case details"
        variant="elevated"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Badge */}
          {formSubmitted && (
            <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <Badge variant="success">Form Submitted Successfully</Badge>
              <p className="text-sm text-green-300">
                Your intake information has been saved.
              </p>
            </div>
          )}

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#00FFA3] uppercase tracking-wide">
              Personal Information
            </h3>

            <ValidatedFormField
              label="Full Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              touched={touched.name}
              placeholder="John Doe"
              required
            />

            <ValidatedFormField
              label="Email Address"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
              placeholder="john@example.com"
              helperText="We'll use this to contact you about your case"
              required
            />

            <ValidatedFormField
              label="Phone Number"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              touched={touched.phone}
              placeholder="(555) 123-4567"
              required
            />
          </div>

          {/* Case Information Section */}
          <div className="border-t border-[#2D3139] pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#00FFA3] uppercase tracking-wide">
              Case Information
            </h3>

            <Dropdown
              label="Type of Case"
              options={caseTypes}
              value={values.caseType}
              onChange={(value) =>
                handleChange({
                  target: { name: 'caseType', value },
                } as any)
              }
              error={touched.caseType ? errors.caseType : undefined}
              placeholder="Select a case type"
            />

            <Dropdown
              label="Case Urgency Level"
              options={urgencyLevels}
              value={values.caseUrgency}
              onChange={(value) =>
                handleChange({
                  target: { name: 'caseUrgency', value },
                } as any)
              }
              placeholder="Select urgency level"
            />

            {values.caseUrgency === 'urgent' && (
              <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <Badge variant="error" size="sm">
                  Urgent Case
                </Badge>
                <p className="text-sm text-red-300">
                  A priority case manager will contact you shortly.
                </p>
              </div>
            )}
          </div>

          {/* Message Section */}
          <div className="border-t border-[#2D3139] pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#00FFA3] uppercase tracking-wide">
              Additional Details
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-gray-200"
              >
                Brief Description of Your Case
              </label>
              <textarea
                id="message"
                name="message"
                value={values.message}
                onChange={(e) =>
                  handleChange({
                    target: { name: 'message', value: e.target.value },
                  } as any)
                }
                className="w-full bg-[#16181D] border border-[#2D3139] rounded-lg p-3 text-white text-sm focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]/30 outline-none transition-colors resize-none"
                rows={4}
                placeholder="Tell us briefly about your legal matter..."
                aria-label="Case description"
              />
              <p className="text-xs text-gray-500">
                {values.message.length}/500 characters
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-[#2D3139] pt-6 flex gap-3">
            <Button variant="secondary" size="md" type="button">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={isLoading}
              type="submit"
              className="flex-1"
            >
              {isLoading ? 'Submitting...' : 'Schedule Consultation'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        title="Confirm Your Information"
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmSubmit}
        confirmText="Schedule Now"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Please review your information before submitting:
          </p>
          <div className="space-y-2 bg-[#16181D] p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Name:</span>
              <span className="text-white font-medium">{values.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Email:</span>
              <span className="text-white font-medium">{values.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Phone:</span>
              <span className="text-white font-medium">{values.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Case Type:</span>
              <span className="text-white font-medium">
                {
                  caseTypes.find((t) => t.value === values.caseType)
                    ?.label
                }
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdvancedClientForm;
