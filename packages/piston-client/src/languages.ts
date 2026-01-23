/**
 * Supported programming languages configuration
 */

export interface LanguageConfig {
  id: string;
  name: string;
  version: string;
  monacoId: string;
  fileExtension: string;
  fileName: string;
  starterCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    id: "python",
    name: "Python",
    version: "3.10.0",
    monacoId: "python",
    fileExtension: "py",
    fileName: "main.py",
    starterCode: `# Write your solution here

def solution():
    # Your code here
    pass

if __name__ == "__main__":
    # Read input and call your solution
    solution()
`,
  },
  {
    id: "java",
    name: "Java",
    version: "15.0.2",
    monacoId: "java",
    fileExtension: "java",
    fileName: "Main.java",
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your solution here

    }
}
`,
  },
  {
    id: "cpp",
    name: "C++",
    version: "10.2.0",
    monacoId: "cpp",
    fileExtension: "cpp",
    fileName: "main.cpp",
    starterCode: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}
`,
  },
  {
    id: "c",
    name: "C",
    version: "10.2.0",
    monacoId: "c",
    fileExtension: "c",
    fileName: "main.c",
    starterCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write your solution here

    return 0;
}
`,
  },
];

/**
 * Get language configuration by ID
 */
export function getLanguageConfig(languageId: string): LanguageConfig | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === languageId);
}

/**
 * Get language version for Piston API
 */
export function getLanguageVersion(languageId: string): string {
  const config = getLanguageConfig(languageId);
  return config?.version || "*";
}

/**
 * Get file name for a language
 */
export function getFileName(languageId: string): string {
  const config = getLanguageConfig(languageId);
  return config?.fileName || "main.txt";
}

/**
 * Get starter code for a language
 */
export function getStarterCode(languageId: string): string {
  const config = getLanguageConfig(languageId);
  return config?.starterCode || "// Write your code here\n";
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(languageId: string): boolean {
  return SUPPORTED_LANGUAGES.some((lang) => lang.id === languageId);
}

/**
 * Get all language IDs
 */
export function getSupportedLanguageIds(): string[] {
  return SUPPORTED_LANGUAGES.map((lang) => lang.id);
}
