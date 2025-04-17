import useThemeContext from "./useThemeContext";

/**
 * Returns one of the two options depending on if dark mode is active. If the `darkMode` parameter is not provided, it defaults to the boolean from ThemeContext.
 */
export default function useThemedOption<T>(lightOption: T, darkOption: T, darkMode: boolean = useThemeContext().darkMode) {
    return darkMode ? darkOption : lightOption;
}