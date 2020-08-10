import { Component, OnInit } from '@angular/core';
import { Router } from '../../../../node_modules/@angular/router';
import { HouseHoldResponse } from '../../client-view/models';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { LoaderService } from '../../common/modules/loader';
import { ClientGoal } from '../models/client-goal';
import { OnBoardingCommonComponent } from '../on-boarding-common.component';
import { OnBoardingService } from '../on-boarding.service';
import { YourGoalService } from '../your-goal/your-goal.service';

declare var $: any;
@Component({
  selector: 'app-your-goal',
  templateUrl: './your-goal.component.html',
  styleUrls: ['./your-goal.component.css']
})
export class YourGoalComponent extends OnBoardingCommonComponent implements OnInit {

  onLoadComponent: boolean = true;

  clientGoalList: ClientGoal[] = [];
  myGoal: ClientGoal[] = [];
  goalCategory: any;
  houseHold: HouseHoldResponse;

  constructor(
    private clientGoalService: YourGoalService,
    private onBoardingService: OnBoardingService,
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService) {
    super();

  }

  ngOnInit() {
    this.myLoadingSpinner.closeImmediate();
    super.scrollTop();
    this.initTooltip();
    this.checkUsingMobile();
    // update current page
    this.onBoardingService.updateCurrentStep(5);

    this.setGoalCategories();
    this.setClientGoalList();
    this.getHouseHoldInfo();
  }


  /**
   * ===========================================================================================================
   *                                            GET/SET DATA
   * ===========================================================================================================
   */


  /**
   * set goal catergories
   */
  setGoalCategories() {
    this.goalCategory = {
      Lifestyle: 509000000,
      Employment: 509000001,
      Financial: 509000002,
      RiskManagement: 509000003,
      TheFuture: 509000004,
      Other: 509000005
    };
  }

  /**
   * init goals can be show for user choose
   */
  setClientGoalList(): ClientGoal[] {
    this.clientGoalList = [
      { goalCategoryId: 509000000, clientGoalId: 509000000, clientGoalName: "House renovation", activeStatus: true, iconCssClass: "fa-paint-brush" },
      { goalCategoryId: 509000000, clientGoalId: 509000001, clientGoalName: "Children's education", activeStatus: true, iconCssClass: "fa-university" },
      { goalCategoryId: 509000000, clientGoalId: 509000002, clientGoalName: "A new child", activeStatus: true, iconCssClass: "fa-child" },
      { goalCategoryId: 509000000, clientGoalId: 509000003, clientGoalName: "Save for a home", activeStatus: true, iconCssClass: "fa-home" },
      { goalCategoryId: 509000000, clientGoalId: 509000004, clientGoalName: "Save for a holiday", activeStatus: true, iconCssClass: "fa-plane" },
      { goalCategoryId: 509000000, clientGoalId: 509000005, clientGoalName: "Save for a car", activeStatus: true, iconCssClass: "fa-car" },

      { goalCategoryId: 509000001, clientGoalId: 509000006, clientGoalName: "Increase in income", activeStatus: true, iconCssClass: "fa-arrow-up" },
      { goalCategoryId: 509000001, clientGoalId: 509000007, clientGoalName: "Decrease in income", activeStatus: true, iconCssClass: "fa-arrow-down" },
      { goalCategoryId: 509000001, clientGoalId: 509000008, clientGoalName: "Career change", activeStatus: true, iconCssClass: "fa-map-signs" },
      { goalCategoryId: 509000001, clientGoalId: 509000009, clientGoalName: "Extended leave", activeStatus: true, iconCssClass: "fa-rocket" },

      { goalCategoryId: 509000002, clientGoalId: 509000010, clientGoalName: "Budget management", activeStatus: true, iconCssClass: "fa-money-bill" },
      { goalCategoryId: 509000002, clientGoalId: 509000011, clientGoalName: "General investing", activeStatus: true, iconCssClass: "fa-dollar-sign" },
      { goalCategoryId: 509000002, clientGoalId: 509000012, clientGoalName: "Purchase property", activeStatus: true, iconCssClass: "fa-building" },
      { goalCategoryId: 509000002, clientGoalId: 509000013, clientGoalName: "Invest in shares", activeStatus: true, iconCssClass: "fa-suitcase" },
      { goalCategoryId: 509000002, clientGoalId: 509000014, clientGoalName: "Self-managed super fund", activeStatus: true, iconCssClass: "fa-calculator" },
      { goalCategoryId: 509000002, clientGoalId: 509000015, clientGoalName: "Help with Superannuation", activeStatus: true, iconCssClass: "fa-pencil" },
      { goalCategoryId: 509000002, clientGoalId: 509000024, clientGoalName: "Reduce debt", activeStatus: true, iconCssClass: "fa-chart-line-down" },

      { goalCategoryId: 509000003, clientGoalId: 509000016, clientGoalName: "Personal insurance", activeStatus: true, iconCssClass: "fa-umbrella" },
      { goalCategoryId: 509000003, clientGoalId: 509000017, clientGoalName: "Wills", activeStatus: true, iconCssClass: "fa-file-alt" },
      { goalCategoryId: 509000003, clientGoalId: 509000018, clientGoalName: "Powers of attorney", activeStatus: true, iconCssClass: "fa-user" },
      { goalCategoryId: 509000003, clientGoalId: 509000019, clientGoalName: "Business risk", activeStatus: true, iconCssClass: "fa-briefcase" },

      { goalCategoryId: 509000004, clientGoalId: 509000020, clientGoalName: "Estate planning", activeStatus: true, iconCssClass: "svg-inline--fa fa-w-12" },
      { goalCategoryId: 509000004, clientGoalId: 509000021, clientGoalName: "Retirement planning", activeStatus: true, iconCssClass: "fa-glass-martini" },
      { goalCategoryId: 509000004, clientGoalId: 509000022, clientGoalName: "Aged care", activeStatus: true, iconCssClass: "fa-blind" },
      { goalCategoryId: 509000004, clientGoalId: 509000023, clientGoalName: "Business succession", activeStatus: true, iconCssClass: "fa-handshake" }
    ];
    return this.clientGoalList;
  }

  /**
   * get house hold
   */
  getHouseHoldInfo() {
    this.onBoardingService.getHouseHold().subscribe(res => {

      if (!res) {

        // route to landing
        return;
      }

      // store house hold
      this.onBoardingService.storeHouseHold(res);

      this.houseHold = res;

      this.getGoalsByHouseHoldId(res.id);
    });
  }

  getGoalsByHouseHoldId(houseHouldId: string) {
    if (!houseHouldId) { return; }
    this.clientGoalService.getGoalByHouseHoldId(houseHouldId).subscribe(res => {
      // handle loading
      if (this.onLoadComponent)
        this.onLoadComponent = false;
      else
        this.showLoading(false);

      if (res && res.data && res.data.data && res.data.data.clientGoalList.length > 0) {
        this.myGoal = res.data.data.clientGoalList;
        // compare value of myGoal
        this.compareAndChangeActiveStatus(this.myGoal);
      }
    }, error => {
      this.showLoading(false);
      console.log("error");
      console.log(error);
    });
  }

  /**
   * get goals by category to show in list
   * @param goalCategoryId
   */
  getClientGoalList(goalCategoryId: number): ClientGoal[] {
    let goalListByCategoryId: ClientGoal[] = [];
    this.clientGoalList.forEach(goal => {
      if (goal.goalCategoryId === goalCategoryId && goal.activeStatus === true)
        goalListByCategoryId.push(goal);
    });
    return goalListByCategoryId;
  }

  /**
   * Mobile version
   * get goals by category to show in list
   * @param goalCategoryId
   */
  getClientGoalListOnMobile(goalCategoryId: number): ClientGoal[] {
    let goalListByCategoryId: ClientGoal[] = [];
    this.clientGoalList.forEach(goal => {
      if (goal.goalCategoryId === goalCategoryId)
        goalListByCategoryId.push(goal);
    });
    return goalListByCategoryId;
  }

  /**
   * get these goals was chosen by user( with activeStatus ==false)
   */
  getMyGoalList(): ClientGoal[] {
    let listGoal: ClientGoal[] = [];
    this.clientGoalList.forEach(goal => {
      if (goal.activeStatus === false && goal.clientGoalId !== 10000000)
        listGoal.push(goal);
    });
    return listGoal;
  }
  /**
   * =========================================== END SECTION ==================================================
   */



  /**
   * ===========================================================================================================
   *                                            GOAL LIST HANDLE
   * ===========================================================================================================
   */

  /**
   * send (submit) list of goals throught api
   */
  submitListOfGoal() {

    let listOfGoal = this.getMyGoalList();
    if (!this.houseHold && this.houseHold.id === '') { return; }
    let listObjectGoal = { ClientGoalList: listOfGoal };

    this.showLoading(true);
    this.clientGoalService.addClientGoalList(this.houseHold.id, listObjectGoal).subscribe(res => {
      this.showLoading(false);

      if (this.isMobile)
        this.router.navigate(["mobile-on-boarding/completed"]);
      else
        this.router.navigate(["on-boarding/completed"]);
    }, error => {
      this.showLoading(false);

      console.log('submit goals error');
      console.log(error);
    });
  }

  /**
   * set activeStatus of these client goal (in this.myGoal get from api) to false
   * that mean it show in my goal
   */
  compareAndChangeActiveStatus(clientGoalList: ClientGoal[]) {
    this.clientGoalList.forEach(goal => {
      clientGoalList.forEach(item => {
        if (goal.clientGoalId === item.clientGoalId) {
          goal.activeStatus = false;
        }
      });
    });
  }

  /**
   * just change activeStatus for which goals have same clientGoalId
   * @param clientGoal
   */
  changeActiveStatus(clientGoal: ClientGoal) {
    this.clientGoalList = this.clientGoalList.map(goal => {
      if (goal.clientGoalId === clientGoal.clientGoalId) {
        goal.activeStatus = !goal.activeStatus;
      }
      return goal;
    });
  }
  /**
   * =========================================== END SECTION ==================================================
   */

  private navigateToStep(url: string) {
    this.router.navigate([url]);
  }
}
