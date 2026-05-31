import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useTheme } from '../theme';

export interface TerminalFileUploadProps {
    accept?: string;
    multiple?: boolean;
    onChange?: (files: File | File[]) => void;
    className?: string;
    disabled?: boolean;
}

export const TerminalFileUpload: React.FC<TerminalFileUploadProps> = ({
    accept = '*',
    multiple = false,
    onChange,
    className = '',
    disabled = false,
}) => {
    const theme = useTheme();
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (newFiles: FileList) => {
        const fileList = Array.from(newFiles);
        setFiles(fileList);
        if (onChange) {
            onChange(multiple ? fileList : fileList[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const getContainerStyle = () => {
        if (disabled) {
            return theme.button.disabled;
        }
        if (dragActive) {
            return theme.button.primary;
        }
        return `${theme.bg} ${theme.border} ${theme.hover} ${theme.text}`;
    };

    return (
        <div className={`relative ${className}`}>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                disabled={disabled}
                className="hidden"
            />

            <div
                onClick={!disabled ? handleClick : undefined}
                onDragEnter={!disabled ? handleDrag : undefined}
                onDragLeave={!disabled ? handleDrag : undefined}
                onDragOver={!disabled ? handleDrag : undefined}
                onDrop={!disabled ? handleDrop : undefined}
                className={`
          relative cursor-pointer
          border-2 border-dashed rounded-none
          p-6 text-center
          transition-colors duration-150
          text-sm
          ${getContainerStyle()}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
            >
                <div className="flex flex-col items-center gap-2">
                    <Upload className={`w-8 h-8 ${disabled ? theme.textMuted : theme.icon}`} />
                    <div>
                        {files.length > 0 ? (
                            <div className="space-y-1">
                                <p>{multiple ? 'Selected files:' : 'Selected file:'}</p>
                                {files.map((file, index) => (
                                    <p key={index} className={theme.textAccent}>{file.name}</p>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p>Drop files here or click to upload</p>
                                <p className={theme.textMuted}>
                                    {multiple ? 'Upload multiple files' : 'Upload a file'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Optional CRT/Scanline effects from theme */}
                {theme.effects?.enableScanlines && (
                    <div className={theme.effects.scanlineClass} aria-hidden="true" />
                )}
                {theme.effects?.enableCrt && (
                    <div className={theme.effects.crtClass} aria-hidden="true" />
                )}
            </div>
        </div>
    );
};

export default TerminalFileUpload;
