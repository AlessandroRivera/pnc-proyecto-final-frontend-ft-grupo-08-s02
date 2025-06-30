import { useContext } from 'react';
import { LayoutContext } from '../layout/Layout';

export default function useLayout() {
    return useContext(LayoutContext);
}
