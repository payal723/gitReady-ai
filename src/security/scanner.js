import fs from 'fs-extra';
import path from 'path';

const SECRET_PATTERNS = [
    { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
    { name: "GitHub Token", regex: /ghp_[a-zA-Z0-9]{36}/ },
    { name: "Private Key", regex: /-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----/ },
    { name: "Generic Secret", regex: /secret[:=]\s*['"][a-zA-Z0-9]{16,}['"]/i }
];

export async function deepScan(directory) {
    const findings = [];
    const files = await fs.readdir(directory, { recursive: true });

    for (const file of files) {
        if (file.includes('node_modules') || file.includes('.git')) continue;

        const fullPath = path.join(directory, file);
        if ((await fs.lstat(fullPath)).isFile()) {
            const content = await fs.readFile(fullPath, 'utf8');
            
            SECRET_PATTERNS.forEach(pattern => {
                if (pattern.regex.test(content)) {
                    findings.push({ file, type: pattern.name });
                }
            });
        }
    }
    return findings;
}