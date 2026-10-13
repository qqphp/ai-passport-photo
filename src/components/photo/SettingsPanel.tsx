interface SettingsPanelProps {
  onRotate: (angle: number) => void;
  currentRotation: number;
  disabled?: boolean;
}

export default function SettingsPanel({ 
  onRotate, 
  currentRotation,
  disabled = false 
}: SettingsPanelProps) {
  const rotationOptions = [
    { angle: 0, label: '0°' },
    { angle: 90, label: '90°' },
    { angle: 180, label: '180°' },
    { angle: 270, label: '270°' },
  ];

  const handleRotate = (angle: number) => {
    if (angle === currentRotation) return;
    onRotate(angle);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">图片旋转</label>
        <div className="grid grid-cols-4 gap-2">
          {rotationOptions.map((option) => (
            <button
              key={option.angle}
              onClick={() => handleRotate(option.angle)}
              disabled={disabled}
              className={`p-2 rounded border text-sm transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-foreground/5'}
                ${currentRotation === option.angle ? 'border-foreground' : 'border-gray-200'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 