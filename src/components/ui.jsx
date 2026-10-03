import {
  Dialog as DialogPrimitive,
  AlertDialog as AlertPrimitive,
  Select as SelectPrimitive,
  Checkbox as CheckboxPrimitive,
  Switch as SwitchPrimitive,
  Progress as ProgressPrimitive,
} from "radix-ui";
import { Check, ChevronDown, X } from "lucide-react";

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = ({ children, ...props }) => (
  <DialogPrimitive.Title className="dialog-title" {...props}>
    {children}
  </DialogPrimitive.Title>
);
export const DialogDescription = ({ children, ...props }) => (
  <DialogPrimitive.Description className="dialog-description" {...props}>
    {children}
  </DialogPrimitive.Description>
);
export function DialogContent({ children, className = "", ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay" />
      <DialogPrimitive.Content
        className={`dialog-content ${className}`}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="dialog-close" aria-label="Close">
          <X size={20} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
export const AlertDialog = AlertPrimitive.Root;
export const AlertDialogTitle = ({ children, ...props }) => (
  <AlertPrimitive.Title className="dialog-title" {...props}>
    {children}
  </AlertPrimitive.Title>
);
export const AlertDialogDescription = ({ children, ...props }) => (
  <AlertPrimitive.Description className="dialog-description" {...props}>
    {children}
  </AlertPrimitive.Description>
);
export function AlertDialogContent({ children, className = "", ...props }) {
  return (
    <AlertPrimitive.Portal>
      <AlertPrimitive.Overlay className="dialog-overlay" />
      <AlertPrimitive.Content
        className={`dialog-content ${className}`}
        {...props}
      >
        {children}
      </AlertPrimitive.Content>
    </AlertPrimitive.Portal>
  );
}
export const AlertDialogFooter = ({ children }) => (
  <div className="dialog-footer">{children}</div>
);
export const AlertDialogCancel = ({ children, ...props }) => (
  <AlertPrimitive.Cancel className="cancel-button" {...props}>
    {children}
  </AlertPrimitive.Cancel>
);
export const AlertDialogAction = ({ children, className = "", ...props }) => (
  <AlertPrimitive.Action className={`primary-button ${className}`} {...props}>
    {children}
  </AlertPrimitive.Action>
);
export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export function SelectTrigger({ children, className = "", ...props }) {
  return (
    <SelectPrimitive.Trigger
      className={`select-trigger ${className}`}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown size={16} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
export function SelectContent({ children }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className="select-content"
        position="popper"
        sideOffset={5}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
export function SelectItem({ children, ...props }) {
  return (
    <SelectPrimitive.Item className="select-item" {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Check size={16} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
export function Checkbox({ className = "", ...props }) {
  return (
    <CheckboxPrimitive.Root className={`checkbox ${className}`} {...props}>
      <CheckboxPrimitive.Indicator>
        <Check size={16} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
export function Switch(props) {
  return (
    <SwitchPrimitive.Root className="switch" {...props}>
      <SwitchPrimitive.Thumb className="switch-thumb" />
    </SwitchPrimitive.Root>
  );
}
export function Progress({ value = 0, className = "", ...props }) {
  return (
    <ProgressPrimitive.Root
      className={`progress ${className}`}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="progress-indicator"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
