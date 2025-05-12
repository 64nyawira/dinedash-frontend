import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { VerifyCodeComponent } from './components/verify-code/verify-code.component';
import { ForgotPassComponent } from './components/forgot-pass/forgot-pass.component';
import { ResetPassComponent } from './components/reset-pass/reset-pass.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { Routes } from '@angular/router';
import { CreateFormComponent } from './components/manager/create-form/create-form.component';
import { OrdersComponent } from './components/manager/orders/orders.component';
import {  ManagerDashComponent } from './components/manager/manager-dash/manager-dash.component';
import { MenusComponent } from './components/manager/menus/menus.component';
import { UserMenuComponent } from './components/user/user-menu/user-menu.component';
import { MenuItemComponent } from './components/user/menu-item/menu-item.component';
import { UserDashComponent } from './components/user/user-dash/user-dash.component';
import { TableReservationComponent } from './components/user/table-reservation/table-reservation.component';
import { UserOrderComponent } from './components/user/user-order/user-order.component';
import { TableComponent } from './components/manager/table/table.component';
import { Component } from '@angular/core';
import { TheReservationsComponent } from './components/manager/the-reservations/the-reservations.component';
import { AdminDashComponent } from './components/admin-dash/admin-dash.component';
import { RewardComponent } from './components/manager/reward/reward.component';
import { ReedemPointsComponent } from './components/user/reedem-points/reedem-points.component';
import { PaymentComponent } from './components/user/payment/payment.component';


export const routes: Routes = [
    {path:'', component:HomeComponent},
    {path:'login',component:LoginComponent},
    {path:'register',component:RegisterComponent},
    {path:'forgot-pass', component: ForgotPassComponent},
    {path: 'verify-code',component:VerifyCodeComponent},
    {path:'reset-pass', component:ResetPassComponent},
    {path:'menu',component:MenusComponent},
    {path:'umenu',component:UserMenuComponent},
    {path:'createForm', component:CreateFormComponent},
    {path:'rewards/:id',component:RewardComponent},
    {path:'redeem/:id',component:ReedemPointsComponent},
    {path:'orders',component:OrdersComponent},
    {path:'reservations',component:TheReservationsComponent },
    {path:'reserve/:id', component:TableReservationComponent}, 
    {path:'myOrders/:id', component:UserOrderComponent},    
    {path:'manager/:id',component:ManagerDashComponent},
    {path:'user-dash/:id',component:UserDashComponent},
    {path:'admin-dash',component:AdminDashComponent},
    {path:'menu-item/:id',component:MenuItemComponent},
    {path:'pay',component:PaymentComponent},
    {path:'user', component:UserDashComponent},
    {path:'reserve',component:TableReservationComponent},
    {path:'createTable',component:TableComponent},
    {path:'**', component:NotFoundComponent},
];
