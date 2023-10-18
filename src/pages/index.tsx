import Home from '@/components/Home';
import { ThirdwebProvider } from "@thirdweb-dev/react";

export default function Index() {
  return (
    <ThirdwebProvider theme="dark" activeChain="goerli">
        <Home/>
    </ThirdwebProvider>
  );
}
