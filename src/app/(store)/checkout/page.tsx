import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import {getStoreSettings,numericSetting} from "@/lib/store-settings";

export const metadata: Metadata = { title: "تسویه حساب" };

export default async function CheckoutPage(){const settings=await getStoreSettings();return <CheckoutClient shippingFee={numericSetting(settings["orders.shippingFee"])}/>;}
